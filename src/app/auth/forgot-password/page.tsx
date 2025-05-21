"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/form/sidebar";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = handleSubmit(async (data) => {
    setMessage("Enviando...");

    const token = crypto.randomUUID();

    const res = await fetch("/api/auth/send-reset-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        token,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      setMessage("Correo enviado correctamente. Revisa tu bandeja de entrada.");
    } else {
      setMessage("Error al enviar el correo: " + result.error);
    }
  });

  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={onSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-96 mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-rose-600">Recuperar Contraseña</h2>

          {message && <p className="text-center mb-4 text-sm text-gray-700">{message}</p>}

          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tucorreo@gmail.com"
            {...register("email", { required: "Este campo es obligatorio" })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
          )}

          <Button type="submit" className="mt-4 w-full">
            Enviar Correo de Recuperación
          </Button>

          <div className="mt-4 text-center">
            <a href="/auth/login" className="text-rose-600 hover:text-rose-700 text-sm">
              Volver a Iniciar Sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}