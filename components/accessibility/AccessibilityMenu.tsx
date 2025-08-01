'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Type, 
  Contrast,
  MousePointer,
  Keyboard,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAccessibility, useScreenReader } from '@/hooks/use-accessibility'

interface AccessibilityMenuProps {
  className?: string
}

export function AccessibilityMenu({ className }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { preferences, updateFontSize } = useAccessibility()
  const { announce } = useScreenReader()
  const [settings, setSettings] = useState({
    animations: !preferences.reduceMotion,
    highContrast: preferences.highContrast,
    focusIndicators: true,
    soundEffects: true,
    fontSize: preferences.fontSize
  })

  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [setting]: value }))
    
    switch (setting) {
      case 'animations':
        document.documentElement.classList.toggle('reduce-motion', !value)
        announce(value ? 'Animaciones activadas' : 'Animaciones desactivadas')
        break
      case 'highContrast':
        document.documentElement.classList.toggle('high-contrast', value as boolean)
        announce(value ? 'Alto contraste activado' : 'Alto contraste desactivado')
        break
      case 'focusIndicators':
        document.documentElement.classList.toggle('enhanced-focus', value as boolean)
        announce(value ? 'Indicadores de foco mejorados activados' : 'Indicadores de foco normales')
        break
      case 'fontSize':
        updateFontSize(value as any)
        announce(`Tamaño de fuente cambiado a ${value}`)
        break
    }
  }

  const resetSettings = () => {
    setSettings({
      animations: true,
      highContrast: false,
      focusIndicators: true,
      soundEffects: true,
      fontSize: 'medium'
    })
    
    document.documentElement.classList.remove('reduce-motion', 'high-contrast', 'enhanced-focus')
    updateFontSize('medium')
    announce('Configuración de accesibilidad restablecida')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          aria-label="Menú de accesibilidad"
          id="accessibility-menu"
        >
          <Accessibility className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        aria-label="Opciones de accesibilidad"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Accesibilidad
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú de accesibilidad"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <Label className="text-sm font-medium">Tamaño de texto</Label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={settings.fontSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('fontSize', size)}
                    className="text-xs"
                    aria-pressed={settings.fontSize === size}
                  >
                    {size === 'small' && 'Pequeño'}
                    {size === 'medium' && 'Normal'}
                    {size === 'large' && 'Grande'}
                    {size === 'extra-large' && 'Muy grande'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label className="text-sm font-medium">Configuración visual</Label>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast" className="text-sm">
                    Alto contraste
                  </Label>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    aria-describedby="high-contrast-desc"
                  />
                </div>
                <p id="high-contrast-desc" className="text-xs text-gray-600 dark:text-gray-400">
                  Mejora la visibilidad con colores de alto contraste
                </p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-indicators" className="text-sm">
                    Indicadores de foco mejorados
                  </Label>
                  <Switch
                    id="focus-indicators"
                    checked={settings.focusIndicators}
                    onCheckedChange={(checked) => handleSettingChange('focusIndicators', checked)}
                    aria-describedby="focus-desc"
                  />
                </div>
                <p id="focus-desc" className="text-xs text-gray-600 dark:text-gray-400">
                  Resalta mejor los elementos enfocados
                </p>
              </div>
            </div>

            {/* Motion Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                <Label className="text-sm font-medium">Movimiento y animaciones</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="text-sm">
                  Activar animaciones
                </Label>
                <Switch
                  id="animations"
                  checked={settings.animations}
                  onCheckedChange={(checked) => handleSettingChange('animations', checked)}
                  aria-describedby="animations-desc"
                />
              </div>
              <p id="animations-desc" className="text-xs text-gray-600 dark:text-gray-400">
                Desactivar si experimentas mareos o distracciones
              </p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <Label className="text-sm font-medium">Atajos de teclado</Label>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Ir al contenido principal:</span>
                  <Badge variant="outline" className="text-xs">Alt + M</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Abrir menú accesibilidad:</span>
                  <Badge variant="outline" className="text-xs">Alt + A</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cerrar modal/menú:</span>
                  <Badge variant="outline" className="text-xs">Escape</Badge>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
              >
                Restablecer configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Screen Reader Only component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip Link component
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-primary-600 text-white px-4 py-2 rounded-md z-50 
                 transition-all duration-200"
      onFocus={() => {
        // Announce to screen readers
        const announcement = 'Enlace para saltar al contenido principal enfocado'
        const event = new CustomEvent('announce', { detail: announcement })
        document.dispatchEvent(event)
      }}
    >
      Saltar al contenido principal
    </a>
  )
}