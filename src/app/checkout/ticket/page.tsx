"use client";

import { useCarrito } from '@/context/CarritoContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TicketPage() {
  const { carrito, total, limpiarCarrito } = useCarrito();
  const router = useRouter();
  const [ticketText, setTicketText] = useState("");
  const [ticketGenerado, setTicketGenerado] = useState(false);

  useEffect(() => {
    if (!ticketGenerado) {
      // Generar el texto del ticket solo si no se ha generado antes
      const date = new Date().toLocaleString();
      const header = "=== Dulces Delicias – Ticket de Compra ===\n";
      const footer = "----------------------------------------\n";
      let subtotal = 0;
      let itemsText = "";
      
      carrito.forEach((item) => {
        const itemTotal = (item.cantidad || 1) * item.precio;
        subtotal += itemTotal;
        itemsText += (item.nombre + " (" + (item.cantidad || 1) + " x $" + item.precio + ") = $" + itemTotal + "\n");
      });
      
      const subtotalLine = "Subtotal: $" + subtotal + "\n";
      const totalLine = "Total: $" + subtotal + "\n";
      const ticket = header + "Fecha: " + date + "\n" + footer + itemsText + footer + subtotalLine + totalLine + footer;
      setTicketText(ticket);
      setTicketGenerado(true);
    }
  }, [carrito, total, ticketGenerado]);

  const handlePrintTicket = () => {
    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ticket_compra.txt";
    a.click();
    URL.revokeObjectURL(url);
    // Limpiar el carrito solo después de generar y descargar el ticket
    limpiarCarrito();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Ticket de Compra</h1>
      <div className="w-full max-w-md p-4 border border-gray-300 rounded shadow bg-white whitespace-pre font-mono text-sm">
         {ticketText}
      </div>
      <div className="mt-4 flex gap-2">
         <Button onClick={handlePrintTicket} className="bg-rose-700 hover:bg-rose-800 text-white">
           Imprimir Ticket
         </Button>
         <Button onClick={() => {
           limpiarCarrito(); // Limpiar el carrito al volver al inicio
           router.push("/");
         }} variant="outline">
           Volver a Inicio
         </Button>
      </div>
    </div>
  );
} 