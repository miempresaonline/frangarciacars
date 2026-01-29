import React, { useEffect, useRef, useState } from 'react';
import ImageWithPlaceholder from './ImageWithPlaceholder';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  animationDirection: 'left' | 'right';
}

const AboutUsSection: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [titleVisible, setTitleVisible] = useState(false); 
  const [timelineProgress, setTimelineProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const teamMembers: TeamMember[] = [
    {
      id: 'fran-garcia',
      name: 'Fran García',
      role: 'Fundador',
      description: 'Apasionado por el motor, lidera el proyecto asegurando confianza y resultados.',
      image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/FRAN_BIEN.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL0ZSQU5fQklFTi5QTkciLCJpYXQiOjE3NTg4MjA0ODUsImV4cCI6NDcxMjc0NDg2MDQ2MDg1fQ.l6LNtlv6lUCSBiaSO02ltXqybg6cSx3f_wpkkOfaf4E',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      animationDirection: 'left'
    },
    {
      id: 'alvaro-lazaro',
      name: 'Álvaro Lázaro',
      role: 'Coordinador',
      description: 'Gestiona cada detalle para que tu experiencia de importación sea impecable.',
      image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/22222.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci8yMjIyMi5QTkciLCJpYXQiOjE3NTkxNTU3NTEsImV4cCI6NDcxMzY4ODYzODEzNTF9.95I_1XjR_odbFnGOoFtUZfbm43f4iTF6melZ6RbbqiI',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      animationDirection: 'right'
    },
    {
      id: 'francesc-bercher',
      name: 'Francesc Vercher',
      role: 'Operador',
      description: 'Encargado de la operativa, asegurando que todo el proceso sea ágil y sin sorpresas.',
      image: 'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/FRANSESC_BIEN.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL0ZSQU5TRVNDX0JJRU4uUE5HIiwiaWF0IjoxNzU4ODIwNTA2LCJleHAiOjM5Mjc0NDkzOTA4NTA2fQ.TQxaqD5qqALLN1tsjxo8_6zOUbfTz7GyQxyNXjw0_7k',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      animationDirection: 'left'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-member-id');
            if (id) {
              setTimeout(() => {
                setVisibleItems(prev => new Set([...prev, id]));
              }, 300);
            }
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    );

    // Title observer
    const titleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTitleVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Timeline progress observer
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
            setTimelineProgress(progress);
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    // Observe team members
    const memberElements = document.querySelectorAll('[data-member-id]');
    memberElements.forEach(el => observer.observe(el));

    // Observe title
    const titleElement = document.querySelector('[data-about-title]');
    if (titleElement) {
      titleObserver.observe(titleElement);
    }

    // Observe timeline
    if (timelineRef.current) {
      timelineObserver.observe(timelineRef.current);
    }

    return () => {
      observer.disconnect();
      titleObserver.disconnect();
      timelineObserver.disconnect();
    };
  }, []);

  const getAnimationClasses = (direction: string, isVisible: boolean) => {
    const baseClasses = 'transition-all duration-1000 ease-out';
    
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return `${baseClasses} opacity-0 -translate-x-16 scale-95 blur-sm`;
        case 'right':
          return `${baseClasses} opacity-0 translate-x-16 scale-95 blur-sm`;
        default:
          return `${baseClasses} opacity-0 scale-95 blur-sm`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-x-0 scale-100 blur-0`;
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-royal-blue/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10" ref={sectionRef}>
        {/* Section Header */}
        <div 
          className="text-center mb-8 lg:mb-12"
          data-about-title
        >
          <div className={`transition-all duration-1000 ease-out ${
            titleVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-royal-blue to-blue-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h2 className={`text-3xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight transition-all duration-1500 ${
              titleVisible ? 'animate-fade-in-up' : ''
            }`}>
              Quiénes estamos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-blue to-blue-600">
                detrás
              </span>
            </h2>
            
            <p className={`text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-1500 delay-300 ${
              titleVisible ? 'animate-fade-in-up' : ''
            }`}>
Un equipo especializado que hace posible que ganes dinero importando            </p>
            
            <div className={`w-24 h-1 bg-gradient-to-r from-royal-blue to-blue-600 mx-auto mt-6 rounded-full transition-all duration-1000 delay-500 ${
              titleVisible ? 'scale-x-100' : 'scale-x-0'
            }`}></div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative" ref={timelineRef}>
          {/* Animated Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-1 bg-gray-200 rounded-full" style={{ height: '100%' }}>
            <div 
              className="w-full bg-gradient-to-b from-royal-blue to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/25"
              style={{ height: `${timelineProgress * 100}%` }}
            ></div>
          </div>

          {/* Team Members */}
          <div className="space-y-12 lg:space-y-16">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                data-member-id={member.id}
                className={`relative ${getAnimationClasses(
                  member.animationDirection, 
                  visibleItems.has(member.id)
                )}`}
                style={{ 
                  transitionDelay: `${index * 400}ms`
                }}
              >
                {/* Desktop Layout - Alternating sides */}
                <div className={`hidden lg:flex items-center ${
                  member.animationDirection === 'left' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {/* Content Side */}
                  <div className={`flex-1 ${
                    member.animationDirection === 'left' ? 'pl-16' : 'pr-16'
                  }`}>
                    <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100 hover:border-blue-200 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                      {/* Background Icon */}
                      <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <div className="w-16 h-16 text-royal-blue">
                          {member.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className={`text-xl lg:text-2xl font-bold mb-2 transition-all duration-1000 delay-300 ${
                          visibleItems.has(member.id) 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                        }`}>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-blue to-blue-600">
                            {member.name}
                          </span>
                        </h3>
                        
                        <p className={`text-gray-500 font-semibold mb-3 transition-all duration-1000 delay-500 ${
                          visibleItems.has(member.id) 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                        }`}>
                          {member.role}
                        </p>
                        
                        <p className={`text-gray-700 leading-relaxed transition-all duration-1000 delay-700 ${
                          visibleItems.has(member.id) 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                        }`}>
                          {member.description}
                        </p>

                        {/* Animated underline */}
                        <div className="mt-4 h-0.5 bg-gradient-to-r from-royal-blue to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-full"></div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-royal-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="relative z-20 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-royal-blue to-blue-600 shadow-2xl shadow-blue-500/25 flex items-center justify-center transition-all duration-500 ${
                      visibleItems.has(member.id)
                        ? 'scale-100 opacity-100'
                        : 'scale-75 opacity-50'
                    }`}>
                      {/* Profile Image Placeholder */}
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold border-2 border-white/30">
                        {member.name.charAt(0)}
                      </div>
                      
                      {/* Pulse effect */}
                      {visibleItems.has(member.id) && (
                        <div className="absolute inset-0 rounded-full bg-royal-blue animate-ping opacity-20"></div>
                      )}
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className={`flex-1 ${
                    member.animationDirection === 'left' ? 'pr-16' : 'pl-16'
                  }`}>
                    <div className={`relative group transition-all duration-1000 delay-200 ${
                      visibleItems.has(member.id)
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}>
                      <div className={`mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl overflow-hidden relative group-hover:scale-110 transition-transform duration-700 ${
                        member.id === 'alvaro-lazaro' ? 'w-56 h-56' : 'w-48 h-48'
                      }`}>
                        <ImageWithPlaceholder
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          placeholderColor="#d1d5db"
                        />
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                          <span className="text-white font-bold">{member.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout - Stacked */}
                <div className="lg:hidden text-center">
                  {/* Timeline Node */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-royal-blue to-blue-600 shadow-xl shadow-blue-500/25 flex items-center justify-center transition-all duration-500 ${
                      visibleItems.has(member.id)
                        ? 'scale-100 opacity-100'
                        : 'scale-75 opacity-50'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      
                      {visibleItems.has(member.id) && (
                        <div className="absolute inset-0 rounded-full bg-royal-blue animate-ping opacity-20"></div>
                      )}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-200 relative overflow-hidden group">
                    {/* Background Icon */}
                    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                      <div className="w-12 h-12 text-royal-blue">
                        {member.icon}
                      </div>
                    </div>

                    {/* Image */}
                    <div className={`mb-6 transition-all duration-1000 delay-200 ${
                      visibleItems.has(member.id)
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}>
                      <div className={`mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg overflow-hidden ${
                        member.id === 'alvaro-lazaro' ? 'w-28 h-28' : 'w-24 h-24'
                      }`}>
                        <ImageWithPlaceholder
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          placeholderColor="#d1d5db"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className={`text-lg font-bold mb-2 transition-all duration-1000 delay-300 ${
                        visibleItems.has(member.id) 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'
                      }`}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-blue to-blue-600">
                          {member.name}
                        </span>
                      </h3>
                      
                      <p className={`text-gray-500 font-semibold text-sm mb-3 transition-all duration-1000 delay-500 ${
                        visibleItems.has(member.id) 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'
                      }`}>
                        {member.role}
                      </p>
                      
                      <p className={`text-gray-700 leading-relaxed text-sm transition-all duration-1000 delay-700 ${
                        visibleItems.has(member.id) 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-4'
                      }`}>
                        {member.description}
                      </p>

                      <div className="mt-3 h-0.5 bg-gradient-to-r from-royal-blue to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 lg:mt-12">
          <div className={`space-y-6 transition-all duration-1000 ${
            visibleItems.size >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3 text-royal-blue font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>¿Listo para trabajar con nosotros?</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              {/* Mensaje de confianza del equipo */}
              <div className="bg-gradient-to-r from-royal-blue/10 to-blue-600/10 backdrop-blur-sm border border-royal-blue/20 rounded-xl px-6 py-4 max-w-2xl mx-auto">
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  <span className="font-bold text-royal-blue">Nuestro equipo especializado</span> te acompañará en cada paso del proceso. 
                  Desde la búsqueda hasta la entrega, <span className="font-bold text-royal-blue">garantizamos transparencia total</span> y el mejor precio del mercado.
                </p>
              </div>
            </div>
            
            {/* Botón CTA prominente */}
            <button 
              onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
              className="premium-cta group relative overflow-hidden bg-gradient-to-r from-[#0029D4] to-blue-600 hover:from-blue-500 hover:to-[#0029D4] text-white px-8 py-4 rounded-xl font-bold transition-all duration-500 shadow-xl hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-2 border-2 border-blue-400/30 text-lg"
            >
              <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>EMPEZAR MI IMPORTACIÓN AHORA</span>
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;