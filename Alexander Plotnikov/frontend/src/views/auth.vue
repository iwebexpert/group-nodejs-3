<template>
  <div class="cont">
    <h1>Авторизация</h1>
    <form class="from">
      <p class="errorMessag" :class="error ? 'active' : ''">
        Не верный логин или пароль
      </p>
      <label for="inputLogin">Логин или email: </label>
      <input
        class="field"
        type="text"
        name="login"
        id="inputLogin"
        placeholder="Введите логин или пароль"
        v-model="login"
      />
      <label for="inputPassword">Пароль: </label>
      <input
        class="field"
        type="password"
        name="password"
        id="inputPassword"
        placeholder="Введите пароль"
        v-model="password"
      />
 <!--      <div class="save">
        <input
          type="checkbox"
          name="save"
          id="inputCheckBox"
          checked
          v-model="save"
        />
        <label for="inputCheckBox">Запомнить</label>
      </div> -->
      <router-link
        :to="{ name: 'registration' }"
        class="to-registrate"
        exact
        active-class="active"
        >Еще не зарегистрированны? Вам сюда...</router-link
      >
    <!--   <router-link :to="{}" class="forget-password" exact active-class="active"
        >Забыли пароль?</router-link
      > -->
      <button
        type="submit"
        :class="!validForm ? 'disabled' : ''"
        :disabled="!validForm ? true : false"
        @click.prevent="toAuth"
      >
        Войти
      </button>
    </form>
  </div>
</template>

<script>
import http from '@/api/http'
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    login: '',
    password: '',
    save: true,
    error: false,
  }),
  components: {},
  methods: {
    ...mapActions({
      setUser: 'user/setUser',
      getTasks: 'tasks/getTasks',
    }),
    async toAuth() {
      try {
        let res = await http.post('auth', {
          login: this.login,
          password: this.password,
          save: this.save,
        })
        if (res.data.result) {
          let {
            data: { token, login, email },
          } = res
          localStorage.setItem('token', token)
          this.error = false
          let user = { token, login, email }
          this.setUser(user)
          this.getTasks()
          this.$router.push('/')
        } else {
          this.error = true
        }
      } catch (e) {
        console.log(e)
      }
    },
  },
  computed: {
    validForm() {
      return this.login !== '' && this.password !== '' ? true : false
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
.errorMessag {
  opacity: 0;
  text-align: left;
  color: red;
}
.errorMessag.active {
  opacity: 1;
}
h1 {
  text-align: left;
  width: 320px;
  margin: 30px 0 10px;
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
  @include placeholder {
    font-size: 0.9rem;
    font-weight: 300;
  }
}
.save {
  margin: 10px 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  & input {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border-radius: 5px;
    border: 1px solid gray;
    &:checked {
      position: relative;
      &::before {
        position: absolute;
        content: '\2714';
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0;
        left: 0;
        background-color: $baseColor;
        width: 20px;
        height: 20px;
        font-size: 1rem;
        color: $darkBaseFont;
        border-radius: 2px;
        border: 1px solid gray;
        @include grayShadow;
      }
    }
  }
  & label {
    font-size: 0.8rem;
    width: auto;
  }
}
.to-registrate,
.forget-password {
  margin: 20px 0 10px;
  text-align: left;
  font-size: 0.8rem;
  color: $darkBaseFont;
  &:hover {
    color: $darkHoverFont;
  }
  &:active {
    color: $darkActiveFont;
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
  font-size: 1.2rem;
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
</style>
