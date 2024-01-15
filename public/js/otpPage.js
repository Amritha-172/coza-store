

// const inputs = document.querySelectorAll("input"),
// button = document.querySelector("button");
// console.log(inputs)
// // iterate over all inputs
// inputs.forEach((input, index1) => {
// input.addEventListener("keyup", (e) => {
//   // This code gets the current input element and stores it in the currentInput variable
//   // This code gets the next sibling element of the current input element and stores it in the nextInput variable
//   // This code gets the previous sibling element of the current input element and stores it in the prevInput variable
//   const currentInput = input,
//     nextInput = input.nextElementSibling,
//     prevInput = input.previousElementSibling;

//   // if the value has more than one character then clear it
//   if (currentInput.value.length > 1) {
//     currentInput.value = "";
//     return;
//   }
//   // if the next input is disabled and the current value is not empty
//   //  enable the next input and focus on it
//   if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
//     nextInput.removeAttribute("disabled");
//     nextInput.focus();
//   }

//   // if the backspace key is pressed
//   if (e.key === "Backspace") {
//     // iterate over all inputs again
//     inputs.forEach((input, index2) => {
//       // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
//       // and the previous element exists, set the disabled attribute on the input and focus on the previous element
//       if (index1 <= index2 && prevInput) {
//         input.setAttribute("disabled", true);
//         input.value = "";
//         prevInput.focus();
//       }
//     });
//   }
//   //if the fourth input( which index number is 3) is not empty and has not disable attribute then
//   //add active class if not then remove the active class.
//   if (!inputs[3].disabled && inputs[3].value !== "") {
//     button.classList.add("active");
//     return;
//   }
//   button.classList.remove("active");
// });
// });

// //focus the first input which index is 0 on window load
// window.addEventListener("load", () => inputs[0].focus());




// //************** countdown ************\\
// document.addEventListener("DOMContentLoaded", function () {
//   const resendButton = document.getElementById("resendButton");
//   const countdownDisplay = document.getElementById("countDown");
//   const email = document.getElementById('email').getAttribute('mail-data')
//   // console.log(email)

//   let countdownTime = 60;
//   function updateTimerDisplay() {
//       countdownDisplay.textContent =` otp resend in ${countdownTime} seconds` ; 
//   }
  
//   function startCountdown() {
//       resendButton.disabled = true;
//       updateTimerDisplay();
      
//       const countdownInterval = setInterval(function () {
//           countdownTime--;
//           updateTimerDisplay();
//           if (countdownTime <= 0) {
//               clearInterval(countdownInterval);
//               resendButton.classList.add('active')
//               resendButton.disabled = false;
//               countdownDisplay.textContent = "";
//               return ;
//           }
//       }, 1000);
//   }
  
//   resendButton.addEventListener("click",async ()=> {
//       const resData = await fetch('/emailVerify',{
//         method:'POST',
//         headers: {
//           'Content-Type': 'application/json' // Specify the content type
//         },
//         body:JSON.stringify({
//           email:email
//         })
//       })
//       console.log(resData)
//       if(resData){
//         console.log("sw")
//       }else{
//         console.log("else")
//       }
//       countdownTime = 60;
//       resendButton.classList.remove('active')
//       startCountdown();
//   });
  
//   startCountdown();
// });
// $(document).ready(function () {
//       $( ' .preloader' ).fadeOut("slow");
//       setTimeout(function(){ $('.preloader').fadeOut('slow'); }, 3000);
//     });