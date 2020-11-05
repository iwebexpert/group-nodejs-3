<template>
  <div class="container">
    <my-header />
     <router-view v-slot="{ Component }">
      <transition
        enter-active-class="page-enter"
        leave-active-class="page-leave"
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    <my-footer />
  </div>
</template>

<script>
import myHeader from '@/components/header'
import myFooter from '@/components/footer'
export default {
  components: { myHeader, myFooter },
}
</script>

<style lang="scss"></style>
