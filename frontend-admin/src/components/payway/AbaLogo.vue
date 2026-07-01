<template>
  <!-- Stylised ABA Bank logo: red leaf shape with white inner curve -->
  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-label="ABA Bank">
    <!-- Outer red leaf -->
    <path
      d="M20 4
         C 28 4, 36 10, 36 20
         C 36 30, 28 36, 20 36
         C 14 36, 8 32, 6 24
         C 12 28, 22 28, 26 22
         C 30 16, 28 8, 20 4 Z"
      fill="#E2001A"/>
    <!-- Inner highlight -->
    <path
      d="M22 9
         C 28 11, 32 16, 30 22
         C 28 27, 22 28, 18 26
         C 22 24, 26 20, 26 16
         C 26 13, 24 10, 22 9 Z"
      fill="#003288"
      opacity="0.9"/>
    <!-- ABA monogram -->
    <text x="20" y="34" text-anchor="middle" fill="#003288" font-family="Arial, Helvetica, sans-serif" font-size="6" font-weight="900">ABA</text>
  </svg>
</template>

<script setup lang="ts"></script>
