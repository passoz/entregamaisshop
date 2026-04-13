import { getRequiredRoleForPortal } from "@/lib/auth/roles"
import { upsertMockUser } from "@/lib/auth/mock-users"
import { NextResponse } from "next/server"

const KEYCLOAK_REALM = "delivery-platform"

type RegisterPayload = {
  name?: string
  email?: string
  password?: string
  role?: string
  cpf?: string
  cnpj?: string
  phone?: string
  storeName?: string
  vehicleType?: string
}

function splitDisplayName(name?: string) {
  const cleaned = (name || "").trim()
  if (!cleaned) {
    return { firstName: "Usuario", lastName: "EntregaMais" }
  }

  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "EntregaMais" }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

function getKeycloakBaseUrl() {
  const realmUrl =
    process.env.KEYCLOAK_INTERNAL_URL ||
    process.env.KEYCLOAK_ISSUER_URL ||
    process.env.NEXT_PUBLIC_KEYCLOAK_URL

  if (!realmUrl) {
    throw new Error("KEYCLOAK_URL_NOT_CONFIGURED")
  }

  return realmUrl.replace(/\/realms\/[^/]+$/, "")
}

async function getAdminToken(baseUrl: string) {
  const username = process.env.KEYCLOAK_ADMIN
  const password = process.env.KEYCLOAK_ADMIN_PASSWORD

  if (!username || !password) {
    throw new Error("KEYCLOAK_ADMIN_CREDENTIALS_NOT_CONFIGURED")
  }

  const params = new URLSearchParams({
    client_id: "admin-cli",
    grant_type: "password",
    username,
    password,
  })

  const response = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("KEYCLOAK_ADMIN_TOKEN_FAILED")
  }

  const data = await response.json()
  return data.access_token as string
}

async function authenticateExistingUser(email: string, password: string) {
  const realmUrl =
    process.env.KEYCLOAK_INTERNAL_URL ||
    process.env.KEYCLOAK_ISSUER_URL ||
    process.env.NEXT_PUBLIC_KEYCLOAK_URL

  if (!realmUrl || !process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
    throw new Error("KEYCLOAK_LOGIN_CONFIG_NOT_CONFIGURED")
  }

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    grant_type: "password",
    username: email,
    password,
    scope: "openid profile email",
  })

  if (process.env.KEYCLOAK_CLIENT_SECRET) {
    params.set("client_secret", process.env.KEYCLOAK_CLIENT_SECRET)
  }

  const response = await fetch(`${realmUrl}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  })

  return response.ok
}

async function getUserByEmail(baseUrl: string, token: string, email: string) {
  const params = new URLSearchParams({ email, exact: "true" })
  const response = await fetch(
    `${baseUrl}/admin/realms/${KEYCLOAK_REALM}/users?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("KEYCLOAK_USER_LOOKUP_FAILED")
  }

  const users = (await response.json()) as Array<{ id: string; email?: string }>
  return users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null
}

async function getRealmRole(baseUrl: string, token: string, roleName: string) {
  const response = await fetch(
    `${baseUrl}/admin/realms/${KEYCLOAK_REALM}/roles/${roleName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("KEYCLOAK_ROLE_LOOKUP_FAILED")
  }

  return response.json()
}

async function getUserRealmRoles(baseUrl: string, token: string, userId: string) {
  const response = await fetch(
    `${baseUrl}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error("KEYCLOAK_USER_ROLES_LOOKUP_FAILED")
  }

  return (await response.json()) as Array<{ name: string }>
}

async function assignRealmRole(baseUrl: string, token: string, userId: string, roleName: string) {
  const currentRoles = await getUserRealmRoles(baseUrl, token, userId)
  if (currentRoles.some((role) => role.name === roleName)) {
    return
  }

  const roleRepresentation = await getRealmRole(baseUrl, token, roleName)
  const response = await fetch(
    `${baseUrl}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/realm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([roleRepresentation]),
    },
  )

  if (!response.ok) {
    throw new Error("KEYCLOAK_ASSIGN_ROLE_FAILED")
  }
}

async function createUser(baseUrl: string, token: string, payload: RegisterPayload) {
  const { firstName, lastName } = splitDisplayName(payload.name)

  const response = await fetch(`${baseUrl}/admin/realms/${KEYCLOAK_REALM}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: payload.email,
      email: payload.email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: payload.password,
          temporary: false,
        },
      ],
      attributes: {
        cpf: payload.cpf ?? "",
        cnpj: payload.cnpj ?? "",
        phone: payload.phone ?? "",
        storeName: payload.storeName ?? "",
        vehicleType: payload.vehicleType ?? "",
      },
    }),
  })

  if (!(response.ok || response.status === 201)) {
    throw new Error("KEYCLOAK_CREATE_USER_FAILED")
  }

  const createdUser = await getUserByEmail(baseUrl, token, payload.email!)
  if (!createdUser) {
    throw new Error("KEYCLOAK_CREATED_USER_NOT_FOUND")
  }

  return createdUser
}

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 })
}

async function provisionLocalProfile(
  payload: RegisterPayload & { email: string; role?: string },
  userId: string,
) {
  const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:8080"

  const response = await fetch(`${backendBaseUrl}/api/v1/public/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      role: getRequiredRoleForPortal(payload.role),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      cpf: payload.cpf,
      cnpj: payload.cnpj,
      storeName: payload.storeName,
      vehicleType: payload.vehicleType,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("BACKEND_LOCAL_PROVISION_FAILED")
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload
    const email = payload.email?.trim().toLowerCase()
    const password = payload.password?.trim()
    const name = payload.name?.trim()
    const requestedRole = getRequiredRoleForPortal(payload.role)

    if (!email || !password || !requestedRole) {
      return badRequest("Dados obrigatórios ausentes para concluir o cadastro.")
    }

    if (password.length < 6) {
      return badRequest("A senha precisa ter pelo menos 6 caracteres.")
    }

    if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
      const user = upsertMockUser(email, name, requestedRole)

      return NextResponse.json(
        {
          message: "Cadastro concluido com sucesso.",
          user: {
            email,
            name: user.name,
            roles: user.roles,
          },
          roleAdded: requestedRole,
        },
        { status: 201 },
      )
    }

    const baseUrl = getKeycloakBaseUrl()
    const adminToken = await getAdminToken(baseUrl)

    let user = await getUserByEmail(baseUrl, adminToken, email)

    if (!user) {
      user = await createUser(baseUrl, adminToken, {
        ...payload,
        email,
        password,
        name,
      })
    } else {
      const passwordMatches = await authenticateExistingUser(email, password)
      if (!passwordMatches) {
        return NextResponse.json(
          {
            message:
              "Esse e-mail já possui conta. Informe a senha atual para liberar uma nova role nesse cadastro.",
          },
          { status: 409 },
        )
      }
    }

    await assignRealmRole(baseUrl, adminToken, user.id, requestedRole)
    await provisionLocalProfile({ ...payload, email }, user.id)

    return NextResponse.json(
      {
        message: "Cadastro concluído com sucesso.",
        user: {
          id: user.id,
          email,
        },
        roleAdded: requestedRole,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Register error:", error)

    return NextResponse.json(
      {
        message: "Não foi possível concluir o cadastro agora.",
      },
      { status: 500 },
    )
  }
}
