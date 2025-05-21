"use client";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/form/sidebar";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setErrorMessage(res.error);
    } else {
      router.push("/dulcesdelicias"); // Redirigir a la página principal o deseada
      router.refresh();
    }
  });

  return (
    // Contenedor principal con Sidebar y fondo similar a la imagen
    <div className="flex min-h-screen bg-[#fdf2f8] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent)]">
      <Sidebar />

      {/* Contenido del login centrado */}
      <div className="flex-1 flex items-center justify-center">
        <form 
          onSubmit={onSubmit}  
          className="w-96 p-8 rounded-lg flex flex-col bg-[#1a1a1a] bg-opacity-90 text-white shadow-xl"
        >
          {/* Tabs de Register/Login */}
          <div className="flex justify-center space-x-4 mb-8">
            {/* 'Registrar' Tab */}
            <a 
              href="/auth/register" 
              className="p-4 text-xl font-bold text-center text-pink-400 hover:text-pink-600 transition-colors"
            >
              Registrar
            </a>
            {/* 'Iniciar Sesión' Tab (activo) */}
            <a 
              href="/auth/login" 
              className="p-4 text-xl font-bold text-center text-pink-500 border-b-2 border-pink-500"
            >
              Iniciar Sesión
            </a>
          </div>

          {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

          {/* Campos del formulario */}
          <div className="mb-4">
            <Label htmlFor="email" className="text-pink-400">Correo Electrónico</Label>
            <Input 
              type="email" 
              placeholder="usuario@gmail.com" 
              {...register("email", { required: "El correo electrónico es requerido" })}
              className="bg-neutral-700 border-none text-white placeholder-gray-400 focus:ring-pink-500"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
          </div>

          <div className="mb-6">
            <Label htmlFor="password" className="text-pink-400">Contraseña</Label>
            <Input 
              type="password" 
              placeholder="********" 
              {...register("password", { required: "La contraseña es requerida" })}
              className="bg-neutral-700 border-none text-white placeholder-gray-400 focus:ring-pink-500"
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message as string}</span>}
          </div>

          {/* Enlace Olvidaste contraseña */}
          <a href="/auth/forgot-password" className="text-pink-400 mb-6 block text-sm hover:text-pink-600 transition-colors text-center">
            ¿Olvidaste tu contraseña?
          </a>

          {/* Botón Iniciar Sesión */}
          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
