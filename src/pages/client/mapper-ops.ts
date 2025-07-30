import type { VariantLabels } from "motion-dom";

export const Methodos = [
  { name: "GET", className: "btn btn-primary" },
  { name: "POST", className: "btn btn-secondary" },
  { name: "PUT", className: "btn btn-accent" },
  { name: "DELETE", className: "btn glass" },
  { name: "PATCH", className: "btn" },
];

export const Opciones = [
  {
    name: "Cuerpo de Peticion",
  },
  {
    name: "Parametros",
  },
  {
    name: "Cabeceras",
  },
  {
    name: "Autenticacion",
  },
];

export const TypesResponse = [
  { name: "JSON", contentType: "" },
  { name: "XML", contentType: "" },
  { name: "raw", contentType: "html" },
  { name: "HTML", contentType: "" },
  { name: "RAW", contentType: "" },
  { name: "BASE64", contentType: "" },
];




export const VariantsAnimation  = {
  initial :  { opacity: 0, y: 10 },
  animate :{ opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 }
  
}