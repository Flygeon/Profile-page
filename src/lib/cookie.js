export function setCookie(name, value, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};${expires};path=/;SameSite=Lax;Secure`
}

export function getCookie(name) {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length)
    if (cookie.indexOf(nameEQ) === 0) {
      const value = decodeURIComponent(cookie.substring(nameEQ.length))
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
  }
  return null
}

export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
