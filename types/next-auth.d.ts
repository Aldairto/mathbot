declare module "next-auth" {
    interface User {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      password?: string | null
    }
  }
  
  