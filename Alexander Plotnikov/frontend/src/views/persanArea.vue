<template>
  <div class="cont">
    <h1>Личный кабинет</h1>
    <form class="from">
      <div>
        <div class="title-login">Вашь логин:</div>
        <div class="value-login">{{ user ? user.login : '***' }}</div>
      </div>
      <div>
        <div class="title-email">Вашь email:</div>
        <div class="value-email">{{ user ? user.email : '***' }}</div>
      </div>
      <button @click.prevent="logOut">
        Выйти
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
      getUser: 'user/getUser',
    }),
    logOut() {
      localStorage.setItem('token', null)
      this.getUser()
      this.$router.push('/auth')
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/user',
    }),
  },
}
</script>
<style lang="scss" scoped>
h1 {
  margin: 30px 0;
}
form > div {
  display: flex;
  margin: 10px 0;
  align-items: center;
}
.title-login,
.title-email {
  font-size: 1.3rem;
  font-weight: 600;
}
.value-login,
.value-email {
  margin-left: 10px;
  font-size: 1.2rem;
  font-weight: 400;
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
  margin: 40px 0 10px;
  @include grayShadow;
  &:hover {
    background-color: $baseBGC;
    color: $lightBaseFont;
  }
  &:active {
    transform: scale(0.99);
  }
}
</style>
