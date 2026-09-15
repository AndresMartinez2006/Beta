export interface InspectionQuestionItem {
  id: string;
  moduleId: number;
  moduleName: string;
  moduleShortName: string;
  subgroup?: string;
  question: string;
  icon: string;
  invertCompliance?: boolean; // If true: "No" is compliant, "Yes" is risk (like alcohol consumption)
  yesLabel?: string;
  noLabel?: string;
  critical?: boolean;
}

export interface InspectionModuleGroup {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
  itemCount: number;
  subgroups: {
    name?: string;
    items: InspectionQuestionItem[];
  }[];
}

export const INSPECTION_QUESTIONS: InspectionQuestionItem[] = [
  // 1. Documentación requerida (Checklist Sí/No)
  {
    id: 'doc_soat',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'SOAT vigente',
    icon: 'verified_user',
    critical: true,
  },
  {
    id: 'doc_tecnomecanica',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'Certificado de revisión técnico-mecánica vigente',
    icon: 'engineering',
    critical: true,
  },
  {
    id: 'doc_licencia',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'Licencia de conducción vigente y acorde a la categoría del vehículo',
    icon: 'badge',
    critical: true,
  },
  {
    id: 'doc_tarjeta_operacion',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'Tarjeta de operación vigente (para servicio público)',
    icon: 'description',
    critical: true,
  },
  {
    id: 'doc_polizas_rc',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'Pólizas de responsabilidad civil contractual y extracontractual vigentes',
    icon: 'policy',
    critical: true,
  },
  {
    id: 'doc_extracto_contrato',
    moduleId: 1,
    moduleName: '1. Documentación requerida',
    moduleShortName: '1. Documentos',
    subgroup: 'Documentación obligatoria de tránsito',
    question: 'Extracto del contrato vigente (sólo vehículos de placa pública)',
    icon: 'assignment',
    critical: false,
  },

  // 2. Estado de Salud y Acondicionamiento del Conductor
  {
    id: 'salud_optima',
    moduleId: 2,
    moduleName: '2. Estado de Salud y Acondicionamiento del Conductor',
    moduleShortName: '2. Salud Conductor',
    subgroup: 'Condición psicofísica del conductor',
    question: '¿Su condición de salud es óptima para la conducción?',
    icon: 'health_and_safety',
    yesLabel: 'Sí (Óptimo)',
    noLabel: 'No (Afectado)',
    critical: true,
  },
  {
    id: 'salud_alcohol_drogas',
    moduleId: 2,
    moduleName: '2. Estado de Salud y Acondicionamiento del Conductor',
    moduleShortName: '2. Salud Conductor',
    subgroup: 'Condición psicofísica del conductor',
    question: '¿Ha consumido alcohol, medicamentos o sustancias psicoactivas en las últimas 24 horas que alteren la seguridad?',
    icon: 'no_drinks',
    invertCompliance: true, // "No" is safe/compliant!
    yesLabel: 'Sí (Consumo / Riesgo)',
    noLabel: 'No (Sin consumo / Apto)',
    critical: true,
  },
  {
    id: 'salud_descanso',
    moduleId: 2,
    moduleName: '2. Estado de Salud y Acondicionamiento del Conductor',
    moduleShortName: '2. Salud Conductor',
    subgroup: 'Condición psicofísica del conductor',
    question: '¿Ha tenido un óptimo descanso previo al inicio de la conducción (mínimo 6 horas de sueño)?',
    icon: 'bedtime',
    yesLabel: 'Sí (≥ 6 horas)',
    noLabel: 'No (Fatiga)',
    critical: true,
  },
  {
    id: 'salud_ruta_planificada',
    moduleId: 2,
    moduleName: '2. Estado de Salud y Acondicionamiento del Conductor',
    moduleShortName: '2. Salud Conductor',
    subgroup: 'Condición psicofísica del conductor',
    question: '¿Ha planificado la ruta antes de salir a carretera?',
    icon: 'route',
    yesLabel: 'Sí (Planificada)',
    noLabel: 'No',
    critical: false,
  },

  // 3. Equipos de Seguridad y Emergencia
  // Subgroup: Kit/Equipo de carretera
  {
    id: 'kit_extintor',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Kit/Equipo de carretera',
    question: 'Extintor de incendios en buen estado (presión y fecha de vencimiento al día)',
    icon: 'fire_extinguisher',
    critical: true,
  },
  {
    id: 'kit_primeros_auxilios',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Kit/Equipo de carretera',
    question: 'Kit de primeros auxilios (botiquín completado)',
    icon: 'medical_services',
    critical: true,
  },
  {
    id: 'kit_equipo_carretera',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Kit/Equipo de carretera',
    question: 'Equipo de carretera: 2 triángulos de seguridad o conos, linterna, gato con capacidad suficiente y cruceta',
    icon: 'warning',
    critical: true,
  },
  {
    id: 'kit_neumatico_repuesto',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Kit/Equipo de carretera',
    question: 'Neumático de repuesto inflado y en buenas condiciones',
    icon: 'tire_repair',
    critical: true,
  },
  {
    id: 'kit_herramientas',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Kit/Equipo de carretera',
    question: 'Caja de herramientas (alicate, destornilladores, llave de expansión y llaves fijas)',
    icon: 'home_repair_service',
    critical: false,
  },
  // Subgroup: Sistemas de protección e identificación
  {
    id: 'seg_cinturones',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Sistemas de protección e identificación',
    question: 'Cinturones de seguridad instalados en todos los asientos y funcionando correctamente',
    icon: 'airline_seat_recline_normal',
    critical: true,
  },
  {
    id: 'seg_gps',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Sistemas de protección e identificación',
    question: 'GPS instalado y en funcionamiento',
    icon: 'pin_drop',
    critical: false,
  },
  {
    id: 'seg_velocimetro',
    moduleId: 3,
    moduleName: '3. Equipos de Seguridad y Emergencia',
    moduleShortName: '3. Seguridad y Emergencia',
    subgroup: 'Sistemas de protección e identificación',
    question: 'Velocímetro (alerta de velocidad) operativo',
    icon: 'speed',
    critical: true,
  },

  // 4. Visibilidad, Espejos y Luces
  // Subgroup: Vidrios y limpiaparabrisas
  {
    id: 'vis_parabrisas',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Vidrios y limpiaparabrisas',
    question: 'Parabrisas libre de fisuras con buena visibilidad',
    icon: 'front_loader',
    critical: true,
  },
  {
    id: 'vis_limpiaparabrisas',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Vidrios y limpiaparabrisas',
    question: 'Gomas de los limpiaparabrisas en buen estado y reserva de agua suficiente',
    icon: 'water',
    critical: false,
  },
  {
    id: 'vis_espejos',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Vidrios y limpiaparabrisas',
    question: 'Todos los espejos retrovisores enteros y libres de fisuras',
    icon: 'crop_portrait',
    critical: true,
  },
  // Subgroup: Iluminación y señalización
  {
    id: 'luces_direccionales',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Iluminación y señalización',
    question: 'Luces direccionales y de estacionamiento/parqueo',
    icon: 'sync_alt',
    critical: true,
  },
  {
    id: 'luces_freno_reversa',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Iluminación y señalización',
    question: 'Luces de freno y luces de retroceso (reversa)',
    icon: 'highlight',
    critical: true,
  },
  {
    id: 'luces_principales_cabina',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Iluminación y señalización',
    question: 'Luces principales y de la cabina',
    icon: 'light_mode',
    critical: true,
  },
  {
    id: 'luces_indicadores_tablero',
    moduleId: 4,
    moduleName: '4. Visibilidad, Espejos y Luces',
    moduleShortName: '4. Visibilidad y Luces',
    subgroup: 'Iluminación y señalización',
    question: 'Indicadores del tablero en buen estado',
    icon: 'dashboard',
    critical: true,
  },

  // 5. Condiciones Mecánicas y Niveles de Fluidos
  // Subgroup: Niveles de líquidos
  {
    id: 'flu_aceite_motor',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Niveles de líquidos',
    question: 'Nivel adecuado de aceite de motor',
    icon: 'oil_barrel',
    critical: true,
  },
  {
    id: 'flu_refrigerante',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Niveles de líquidos',
    question: 'Nivel adecuado de líquido refrigerante',
    icon: 'ac_unit',
    critical: true,
  },
  {
    id: 'flu_liquido_frenos',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Niveles de líquidos',
    question: 'Nivel adecuado de líquido de frenos',
    icon: 'water_drop',
    critical: true,
  },
  // Subgroup: Sistemas mecánicos
  {
    id: 'mec_freno_servicio_mano',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Sistemas mecánicos',
    question: 'Freno de servicio y freno de mano operando correctamente',
    icon: 'adjust',
    critical: true,
  },
  {
    id: 'mec_embrague',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Sistemas mecánicos',
    question: 'Embrague funcionando adecuadamente',
    icon: 'swap_driving_apps_wheel',
    critical: true,
  },
  {
    id: 'mec_pito_alarma_reversa',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Sistemas mecánicos',
    question: 'Pito y alarma de reversa en funcionamiento',
    icon: 'volume_up',
    critical: true,
  },
  {
    id: 'mec_escape',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Sistemas mecánicos',
    question: 'Sistema de escape libre de fugas y en buen estado',
    icon: 'air',
    critical: false,
  },
  {
    id: 'mec_aire_acondicionado',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Sistemas mecánicos',
    question: 'Aire acondicionado en funcionamiento',
    icon: 'mode_fan',
    critical: false,
  },
  // Subgroup: Llantas/Neumáticos
  {
    id: 'lla_estado_labrado',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Llantas/Neumáticos',
    question: 'Estado general de llantas (sin abolladuras/deformaciones y profundidad de labrado mayor a 2 mm)',
    icon: 'tire_repair',
    critical: true,
  },
  {
    id: 'lla_presion_aire',
    moduleId: 5,
    moduleName: '5. Condiciones Mecánicas y Niveles de Fluidos',
    moduleShortName: '5. Mecánica y Fluidos',
    subgroup: 'Llantas/Neumáticos',
    question: 'Presión de aire correcta en neumáticos',
    icon: 'speed',
    critical: true,
  },

  // 6. Higiene y Validación
  // Subgroup: Estado de limpieza
  {
    id: 'hig_limpieza',
    moduleId: 6,
    moduleName: '6. Higiene y Validación',
    moduleShortName: '6. Higiene',
    subgroup: 'Estado de limpieza',
    question: 'Limpieza interna y externa del vehículo',
    icon: 'cleaning_services',
    critical: false,
  },
];

export const MODULE_GROUPS: InspectionModuleGroup[] = [
  {
    id: 1,
    title: '1. Documentación requerida',
    shortTitle: '1. Documentos',
    icon: 'assignment',
    itemCount: 6,
    subgroups: [
      {
        name: 'Checklist Sí/No',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 1),
      },
    ],
  },
  {
    id: 2,
    title: '2. Estado de Salud y Acondicionamiento del Conductor',
    shortTitle: '2. Salud Conductor',
    icon: 'health_and_safety',
    itemCount: 4,
    subgroups: [
      {
        name: 'Acondicionamiento y Aptitud',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 2),
      },
    ],
  },
  {
    id: 3,
    title: '3. Equipos de Seguridad y Emergencia',
    shortTitle: '3. Seguridad y Emergencia',
    icon: 'security',
    itemCount: 8,
    subgroups: [
      {
        name: 'Kit/Equipo de carretera',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 3 && q.subgroup === 'Kit/Equipo de carretera'),
      },
      {
        name: 'Sistemas de protección e identificación',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 3 && q.subgroup === 'Sistemas de protección e identificación'),
      },
    ],
  },
  {
    id: 4,
    title: '4. Visibilidad, Espejos y Luces',
    shortTitle: '4. Visibilidad y Luces',
    icon: 'highlight',
    itemCount: 7,
    subgroups: [
      {
        name: 'Vidrios y limpiaparabrisas',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 4 && q.subgroup === 'Vidrios y limpiaparabrisas'),
      },
      {
        name: 'Iluminación y señalización',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 4 && q.subgroup === 'Iluminación y señalización'),
      },
    ],
  },
  {
    id: 5,
    title: '5. Condiciones Mecánicas y Niveles de Fluidos',
    shortTitle: '5. Mecánica y Fluidos',
    icon: 'minor_crash',
    itemCount: 10,
    subgroups: [
      {
        name: 'Niveles de líquidos',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 5 && q.subgroup === 'Niveles de líquidos'),
      },
      {
        name: 'Sistemas mecánicos',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 5 && q.subgroup === 'Sistemas mecánicos'),
      },
      {
        name: 'Llantas/Neumáticos',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 5 && q.subgroup === 'Llantas/Neumáticos'),
      },
    ],
  },
  {
    id: 6,
    title: '6. Higiene y Validación',
    shortTitle: '6. Higiene',
    icon: 'cleaning_services',
    itemCount: 1,
    subgroups: [
      {
        name: 'Estado de limpieza',
        items: INSPECTION_QUESTIONS.filter((q) => q.moduleId === 6),
      },
    ],
  },
];
