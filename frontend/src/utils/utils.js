export const getCurrentUserType =  (path) => {
    const userType = path.replaceAll("/", " ").trim().split(" ").pop().toUpperCase()
    return userType
}