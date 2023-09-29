export const DOMAIN = "http://127.0.0.1:8000"

export const getCurrentUserType =  (path) => {
    const userType = path.replaceAll("/", " ").trim().split(" ").pop().toUpperCase()
    return userType
}