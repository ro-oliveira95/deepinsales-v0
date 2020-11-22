// document.querySelector(".getData").addEventListener("click", getData);
document.querySelector(".container-form").addEventListener("submit", login);
const loginEmail = document.querySelector("#email");
const loginPassword = document.querySelector("#password");

// // function getData() {
// //   axios
// //     .get("/api/v1/ads")
// //     .then((res) => console.log(res))
// //     .catch((err) => console.log(err));
// // }

function login(e) {
  e.preventDefault();

  axios
    .post("/api/v1/auth/login", {
      email: loginEmail.value,
      password: loginPassword.value,
    })
    .then((res) => {
      token = `Bearer ${res.data.token}`;
      //window.location.href = "http://localhost:5000/index";
      console.log(token);
      axios.get("/index", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
    })
    .catch((err) => console.log(err));
}

// const config = {
//   headers: {
//     "User-Agent": "PostmanRuntime/7.26.8",
//     Accept: "*/*",
//     "Accept-Encoding": "gzip, deflate, br",
//     Connection: "keep-alive",
//   },
// };

// axios
//   .get(
//     "https://www.mercadolivre.com.br/ventilador-de-mesa-e-parede-mondial-nv-15-6p-fb-preto-com-6-pas-30cm-de-dimetro-127v/p/MLB15290743?pdp_filters=category:MLB1645#searchVariation=MLB15290743&position=2&type=product&tracking_id=a43cde9c-f5c7-4c52-b0b6-3a10086283d5",
//     config
//   )
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => console.log("erro"));
