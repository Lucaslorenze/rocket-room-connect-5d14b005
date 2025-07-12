export const formatPrice = (price) => {
  if (!price && price !== 0) return '$0';
  
  // Convertir a string y separar parte entera de decimal
  const [integerPart, decimalPart] = price.toString().split('.');
  
  // Formatear parte entera con puntos como separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Si hay decimales, agregar con coma
  if (decimalPart) {
    return `$${formattedInteger},${decimalPart}`;
  }
  
  return `$${formattedInteger}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};