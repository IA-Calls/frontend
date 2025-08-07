import React from 'react';

export const WelcomeSection = () => {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 relative overflow-hidden" 
         style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0" style={{opacity: '0.1'}}>
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full" style={{filter: 'blur(50px)'}}></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full" style={{filter: 'blur(60px)'}}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" style={{filter: 'blur(40px)'}}></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 text-white">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight">
              Bienvenido a
              <br />
              <span className="text-white opacity-90">
                Tu Plataforma
              </span>
            </h1>
            <p className="text-xl text-white opacity-80 max-w-md leading-relaxed">
              Conecta, colabora y crea experiencias extraordinarias con nuestra plataforma innovadora.
            </p>
          </div>
          
          {/* Características destacadas */}
          <div className="space-y-6 pt-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Seguridad Avanzada</h3>
                <p className="text-white opacity-75 text-sm">Protección de datos de última generación</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Rendimiento Óptimo</h3>
                <p className="text-white opacity-75 text-sm">Velocidad y eficiencia sin compromisos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Colaboración Fluida</h3>
                <p className="text-white opacity-75 text-sm">Herramientas diseñadas para equipos</p>
              </div>
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="pt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white opacity-75 mt-1">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white opacity-75 mt-1">Tiempo Activo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-white opacity-75 mt-1">Soporte</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Elementos decorativos flotantes */}
      <div className="absolute bottom-10 left-10 w-4 h-4 bg-white opacity-60 rounded-full animate-bounce"></div>
      <div className="absolute top-1/4 right-16 w-2 h-2 bg-white opacity-80 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white opacity-40 rounded-full animate-bounce"></div>
    </div>
  );
}; 