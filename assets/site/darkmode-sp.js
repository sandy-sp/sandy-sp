const mqDark = window.matchMedia("(prefers-color-scheme: dark)")

const darkModeToggle = document.querySelector("div.dark-mode-toggle")
const darkModeToggleText = darkModeToggle.querySelector("span")
const circle = document.querySelector("circle")

const bodyTag = document.querySelector("body")


darkModeToggle.addEventListener("click", function () {
  bodyTag.classList.toggle("dark-mode")

  if (bodyTag.classList.contains("dark-mode")) {
    darkModeToggleText.innerHTML = "Light mode"
    
   
  } else {
    darkModeToggleText.innerHTML = "Dark mode"
  
   
  }
  
})


const updateDarkMode = function () {
  if (mqDark.matches) {
    bodyTag.classList.add("dark-mode")
  	darkModeToggleText.innerHTML = "Light mode"
  
   
	} else {
    bodyTag.classList.remove("dark-mode")
    darkModeToggleText.innerHTML = "Dark mode"
    
  
  }
}

updateDarkMode()
mqDark.addListener(function () {
  updateDarkMode()
})








