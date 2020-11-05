<template>
  <div class="cont">
    <h1>Регистрация</h1>
    <form class="from">
      <div v-for="(field, i) in forma" :key="field + i">
        <label for="inputLogin">{{ field.name }} </label>
        <input
          class="field"
          :type="field.type"
          v-model="field.value"
          v-on:input="valid(i)"
          :placeholder="field.placeholder"
          :class="getClass(i)"
        />
        <p v-if="!field.validCase1 && field.active" class="errorMessage">
          {{ field.message[0] }}
        </p>
        <p v-if="!field.validServer && field.active" class="errorMessage">
          {{ field.message[1] }}
        </p>

        <p
          v-if="
            !field.validCase2 && !field.name.includes('Пароль') && field.active
          "
          class="errorMessage"
        >
          {{ field.message[1] }}
        </p>
      </div>

      <button
        type="submit"
        :class="!validForm ? 'disabled' : ''"
        :disabled="!validForm ? true : false"
        @click.prevent="toRegistrate"
      >
        Зарегистрироваться
      </button>
    </form>
  </div>
</template>

<script>

let delay = async (delay = 0) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), delay)
  })

import  http  from '@/api/http'

export default {
  data: () => ({
    forma: [
      {
        name: 'Логин',
        id: 'login',
        type: 'text',
        message: [
          'Минимальная длина этого поля 2 символа',
          'Этот логин уже занят',
        ],
        regExp: ['[а-яА-ЯёЁA-z0-9]{3,}$', 'i'],
        placeholder: 'Введите логин',
      },
      {
        name: 'Email',
        id: 'email',
        type: 'email',
        message: ['Необходимый формат: nick@mail.com.', 'Этот email уже занят'],
        regExp: [
          '^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$',
          'i',
        ],
        placeholder: 'Введите email',
      },
      {
        name: 'Пароль',
        type: 'password',
        id: 'password1',
        message: [
          'Минимальная длина этого поля 5 символов',
          'Пароли не совпадают',
        ],
        regExp: ['\\w{5,}$', 'i'],
        placeholder: 'Введите пароль',
      },
      {
        name: 'Повторите пароль',
        type: 'password',
        id: 'password2',
        message: [
          'Минимальная длина этого поля 5 символов',
          'Пароли не совпадают',
        ],
        regExp: ['\\w{5,}$', 'i'],
        placeholder: 'Введите пароль',
      },
    ],
  }),
  created() {
    this.forma = this.forma.map((f) => ({
      ...f,
      validCase1: false,
      validCase2: true,
      value: '',
      validServer: true,
      active: false,
    }))
    console.log()
  },
  methods: {
    async valid(i) {
      let field = this.forma[i]

      field.active = true
      // проверка формата
      if (new RegExp(...field.regExp).test(field.value)) {
        field.validCase1 = true
      } else {
        field.validCase1 = false
      }
      // проверка неа совпадение паролей
      if (field.type.includes('password')) {
        let [pas1, pas2] = this.forma.filter((f) => f.type.includes('password'))
        if (pas1.value !== pas2.value) {
          this.forma.forEach(
            (f) => f.type.includes('password') && (f.validCase2 = false)
          )
        } else {
          this.forma.forEach(
            (f) => f.type.includes('password') && (f.validCase2 = true)
          )
        }
      }
      // проверка на наличие логина и email в базе данных
      if (field.name.includes('Логин') || field.name.includes('Email')) {
        await delay(100)
        let {
          status,
          data: { result },
        } = await http(
          field.name.includes('Логин')
            ? `checkLogin/${field.value}`
            : `checkEmail/${field.value}`
        )
        if (!result && +status === 200) {
          field.validServer = true
        } else {
          field.validServer = false
        }
      }
    },
    getClass(i) {
      let field = this.forma[i]
      if (
        field.active &&
        field.validCase1 &&
        (field.name.includes('Пароль') ? true : field.validCase2) &&
        field.validServer
      ) {
        return 'valid'
      } else if (field.active) {
        return 'error'
      }
    },
    async toRegistrate() {
      let user = {}
      this.forma.forEach((f) => {
        console.log(f.id)
        user[f.id] = f.value
      })
      let {
        data: { result },
      } = await http.post('registration', user)
      if (result) {
        this.$router.push('/auth')
      }
    },
  },
  computed: {
    validForm() {
      return this.forma.some(
        (f) => !f.validCase1 || !f.validCase2 || !f.validServer
      )
        ? false
        : true
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  width: 100%;
  max-width: $baseWidth;
  margin: 0 auto;
  padding: 10px 0;
  flex-direction: column;
  align-items: center;
}

h1 {
  text-align: left;
  width: 320px;
  margin: 10px 0;
  font-size: 1.5rem;
}
.from {
  margin-top: 2vh;
  width: 320px;
  display: flex;
  flex-direction: column;
}
label {
  margin: 10px 0;
  width: 300px;
  display: flex;
  align-items: flex-start;
}
input.field {
  width: 300px;
  height: 50px;
  padding: 0 10px;
  outline: none;
  font-size: 0.9rem;
  border: 1px solid rgba(128, 128, 128, 0.89);
  border-radius: 3px;
  @include grayShadow;
  box-sizing: border-box;
  &:focus {
    background-color: $focusColor;
  }
  &.valid {
    border: 1px solid $baseColor;
    -webkit-box-shadow: 0px 0px 4px 1px $baseColor !important;
    -moz-box-shadow: 0px 0px 4px 1px $baseColor !important ;
    box-shadow: 0px 0px 4px 1px $baseColor !important;
  }

  &.error {
    border: 1px solid red;
    -webkit-box-shadow: 0px 0px 4px 1px rgba(230, 9, 9, 1) !important;
    -moz-box-shadow: 0px 0px 4px 1px rgba(230, 9, 9, 1) !important;
    box-shadow: 0px 0px 4px 1px rgba(230, 9, 9, 1) !important;
    background-color: $errorFocusColor;
  }
  @include placeholder {
    font-size: 0.9rem;
    font-weight: 300;
  }
}
button {
  width: 300px;
  border-radius: 2px;
  background-color: $baseColor;
  box-sizing: border-box;
  padding: 0 10px;
  height: 50px;
  border: none;
  outline: none;
  display: flex;
  font-size: 1rem;
  align-items: center;
  color: $lightBaseFont;
  justify-content: center;
  margin: 10px 0;
  @include grayShadow;
  &:hover {
    background-color: $baseBGC;
    color: $lightBaseFont;
  }
  &:active {
    transform: scale(0.99);
  }
}
button.disabled {
  width: 300px;
  border-radius: 2px;
  background-color: $disabledColor;
  box-sizing: border-box;
  padding: 0 10px;
  height: 50px;
  border: none;
  outline: none;
  display: flex;
  font-size: 1rem;
  align-items: center;
  color: $lightBaseFont;
  justify-content: center;
  cursor: not-allowed;
  margin: 10px 0;
  @include grayShadow;
  &:hover {
    background-color: $disabledColor;
    color: $lightBaseFont;
  }
  &:active {
    transform: scale(1);
  }
}
.errorMessage {
  display: flex;
  margin: 5px 0;
  width: 300px;
  font-size: 0.8rem;
  color: red;
}
</style>
