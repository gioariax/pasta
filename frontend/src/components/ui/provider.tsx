"use client"

import { ChakraProvider, defaultConfig, createSystem, defineConfig } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const customConfig = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "#27272a" }
          }
        }
      }
    }
  }
})

const system = createSystem(defaultConfig, customConfig)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
