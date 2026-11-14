import { Course, AccessKey, UserProfile, Announcement, ClinicSettings, Enrollment, LessonProgress, LessonNote } from '../types';

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
  clinicName: 'Nishtar Medical Academy',
  tagline: 'Center for Advanced Cataract, Phaco Surgery & Clinical Ophthalmology Training, Multan',
  doctorName: 'Prof. Dr. M. Hashmi',
  doctorTitle: 'MBBS, FCPS (Ophthalmology), Consultant Eye Surgeon',
  doctorBio: 'Senior Consultant Ophthalmologist & Eye Surgeon with 20+ years of clinical and surgical experience at Nishtar Medical University & Hospital Multan. Trained hundreds of postgraduate eye residents, house officers, and clinical optometrists across South Punjab.',
  phone: '+92 300 7312345',
  whatsappNumber: '923007312345',
  email: 'info@nishtaracademy.pk',
  address: 'Nishtar Medical Academy, Nishtar Road, Opp. Gate 2, Multan, Punjab',
  city: 'Multan',
  jazzCashAccount: '0300 7312345',
  jazzCashTitle: 'Dr. M. Hashmi',
  easyPaisaAccount: '0300 7312345',
  easyPaisaTitle: 'Dr. M. Hashmi',
  bankDetails: 'Habib Bank Ltd (HBL) Nishtar Road Multan | Account: 00427901882301 | Title: Nishtar Medical Academy',
  keyPrefix: 'NMA',
  defaultDevicesPerKey: 2,
  defaultValidityDays: 180,
  watermarkEnabled: true,
  pauseOnTabBlur: false,
};

export const INITIAL_USERS: UserProfile[] = [
  // Demo staff logins (change these passwords from Account > Security):
  //   admin@demo.com / Admin@123      supervisor@demo.com / Super@123
  {
    uid: 'admin-001',
    name: 'Prof. Dr. M. Hashmi',
    phone: '+92 300 7312345',
    email: 'admin@demo.com',
    emailVerified: true,
    passwordHash: 'e46a49b7c96f7a697c12d8177efbec97be8630d3928275c4c3ed2e7caeb8f575',
    city: 'Multan',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    uid: 'supervisor-001',
    name: 'Dr. Sana Iqbal',
    phone: '+92 301 6543210',
    email: 'supervisor@demo.com',
    emailVerified: true,
    passwordHash: '419d89c9e6b47a7ca6d5243458a662ead1fb2286cf395610eebf71d83d9147ee',
    city: 'Multan',
    role: 'supervisor',
    status: 'active',
    createdAt: '2025-01-05T08:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  // Students have no password: they sign in with their access key only.
  {
    uid: 'student-001',
    name: 'Dr. Ahmed Raza',
    phone: '+92 312 8765432',
    email: 'ahmed@demo.com',
    emailVerified: true,
    city: 'Multan',
    role: 'student',
    status: 'active',
    createdAt: '2025-02-10T10:30:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    uid: 'student-002',
    name: 'Dr. Fatima Noor',
    phone: '+92 333 4567890',
    email: '',
    emailVerified: false,
    city: 'Bahawalpur',
    role: 'student',
    status: 'active',
    createdAt: '2025-02-15T14:20:00Z',
    lastActiveAt: new Date().toISOString(),
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-phaco',
    title: 'Phacoemulsification & Cataract Surgery Masterclass',
    slug: 'phaco-cataract-surgery',
    shortDescription: 'Step-by-step OT video demonstrations of clear corneal incision, capsulorhexis, hydrodissection, nucleofracture, and foldable IOL implantation.',
    description: 'Master practical modern cataract surgery from Prof. Dr. M. Hashmi at Nishtar Medical Academy Multan. Designed for Ophthalmology postgraduates and junior eye surgeons: learn continuous curvilinear capsulorhexis (CCC), divide-and-conquer vs stop-and-chop phaco techniques, cortical cleanup, and managing posterior capsular rupture.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    category: 'Cataract & Surgical Retina',
    instructor: 'Prof. Dr. M. Hashmi',
    instructorTitle: 'FCPS (Ophthalmology), Senior Eye Surgeon',
    level: 'Advanced',
    language: 'English',
    published: true,
    order: 1,
    totalLessons: 6,
    totalDuration: 67,
    pricePkr: 8500,
    featured: true,
    createdAt: '2025-01-10T12:00:00Z',
    modules: [
      {
        id: 'mod-p1',
        courseId: 'course-phaco',
        title: 'Module 1: Biometry, Incision Planning & Capsulorhexis',
        order: 1,
        lessons: [
          {
            id: 'les-p1',
            moduleId: 'mod-p1',
            courseId: 'course-phaco',
            title: '1. A-Scan Ultrasound Biometry & IOL Power Calculation Formulas',
            description: 'Learn SRK/T, Barrett Universal II, and Hoffer Q formula selection for axial length measurement in high myopic and hyperopic eyes.',
            videoUrl: 'https://youtu.be/CrUJJDqDwPA',
            duration: 2389,
            durationFormatted: '39:49',
            attachments: [
              { id: 'att-p1', name: 'IOL_Power_Calculation_Cheatsheet.pdf', url: '#', size: '2.1 MB', type: 'pdf' },
            ],
            isFreePreview: true,
            order: 1,
          },
          {
            id: 'les-p2',
            moduleId: 'mod-p1',
            courseId: 'course-phaco',
            title: '2. Clear Corneal Tri-Planar Incision & Paracentesis Construction',
            description: 'Master self-sealing 2.2mm vs 2.8mm keratome incision architecture to prevent postoperative endophthalmitis and induced astigmatism.',
            videoUrl: 'https://youtu.be/XpUvg4BTcqw',
            duration: 227,
            durationFormatted: '3:47',
            attachments: [
              { id: 'att-p2', name: 'Corneal_Wound_Architecture.pdf', url: '#', size: '1.4 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 2,
          },
          {
            id: 'les-p3',
            moduleId: 'mod-p1',
            courseId: 'course-phaco',
            title: '3. Continuous Curvilinear Capsulorhexis (CCC) Under Viscoelastic',
            description: 'Cystotome and Utrata forceps techniques: sizing a 5.0 to 5.5mm capsulorhexis and rescuing the runaway tear using Little rescue maneuver.',
            videoUrl: 'https://youtu.be/ksIrATzY6uk',
            duration: 521,
            durationFormatted: '8:41',
            attachments: [
              { id: 'att-p3', name: 'Capsulorhexis_Troubleshooting.pdf', url: '#', size: '1.8 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 3,
          }
        ]
      },
      {
        id: 'mod-p2',
        courseId: 'course-phaco',
        title: 'Module 2: Phacoemulsification Dynamics & IOL Implantation',
        order: 2,
        lessons: [
          {
            id: 'les-p4',
            moduleId: 'mod-p2',
            courseId: 'course-phaco',
            title: '4. Hydrodissection, Hydrodelineation & Safe Nuclear Rotation',
            description: 'Achieving a complete fluid wave to mobilize dense hard cataracts without stressing zonular fibers.',
            videoUrl: 'https://youtu.be/4-Ye4gtzF3M',
            duration: 274,
            durationFormatted: '4:34',
            attachments: [
              { id: 'att-p4', name: 'Hydrodissection_Steps.pdf', url: '#', size: '1.2 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 1,
          },
          {
            id: 'les-p5',
            moduleId: 'mod-p2',
            courseId: 'course-phaco',
            title: '5. Stop & Chop vs Divide & Conquer Nucleofracture Techniques',
            description: 'Trenching depth, cross-action cracking, high vacuum quadrant removal, and corneal endothelial protection.',
            videoUrl: 'https://youtu.be/rEDkTTlz_Yc',
            duration: 475,
            durationFormatted: '7:55',
            attachments: [
              { id: 'att-p5', name: 'Phaco_Machine_Parameters_Guide.pdf', url: '#', size: '2.5 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 2,
          },
          {
            id: 'les-p6',
            moduleId: 'mod-p2',
            courseId: 'course-phaco',
            title: '6. Cortical Cleanup & Foldable Hydrophobic IOL Implantation in the Bag',
            description: 'Bimanual vs coaxial I/A, sub-incisional cortex stripping, in-the-bag lens injection, and checking stromal hydration.',
            videoUrl: 'https://youtu.be/lQtHb4wF-kU',
            duration: 119,
            durationFormatted: '1:59',
            attachments: [
              { id: 'att-p6', name: 'IOL_Placement_Checklist.pdf', url: '#', size: '1.6 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 3,
          }
        ]
      }
    ]
  },
  {
    id: 'course-slitlamp',
    title: 'Slit-Lamp Bio-Microscopy & Clinical Eye Examination',
    slug: 'slit-lamp-examination-skills',
    shortDescription: 'Master diffuse, focal slit, retroillumination, Van Herick angle depth, and direct 90D/78D fundus examination.',
    description: 'Clinical examination masterclass for ophthalmology residents and optometrists. Learn to use the slit-lamp for anterior segment pathology, corneal ulcers, anterior chamber cells/flare grading, intraocular pressure measurement (Goldmann Applanation Tonometry), and dilated stereoscopic fundus examination.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
    category: 'Clinical Ophthalmology',
    instructor: 'Dr. Asim Cheema',
    instructorTitle: 'FCPS (Ophthalmology), Anterior Segment Specialist',
    level: 'Beginner',
    language: 'English',
    published: true,
    order: 2,
    totalLessons: 4,
    totalDuration: 33,
    pricePkr: 6000,
    featured: true,
    createdAt: '2025-01-20T10:00:00Z',
    modules: [
      {
        id: 'mod-s1',
        courseId: 'course-slitlamp',
        title: 'Module 1: Slit-Lamp Optics & Illumination Techniques',
        order: 1,
        lessons: [
          {
            id: 'les-s1',
            moduleId: 'mod-s1',
            courseId: 'course-slitlamp',
            title: '1. Slit Lamp Optics, Eyepiece Calibration & Illumination Angles',
            description: 'Direct focal illumination, specular reflection for endothelial drop-out, sclerotic scatter, and retroillumination for lens opacities.',
            videoUrl: 'https://youtu.be/gHW5OYj1Gf8',
            duration: 255,
            durationFormatted: '4:15',
            attachments: [
              { id: 'att-s1', name: 'Slit_Lamp_Illumination_Types.pdf', url: '#', size: '2.0 MB', type: 'pdf' }
            ],
            isFreePreview: true,
            order: 1,
          },
          {
            id: 'les-s2',
            moduleId: 'mod-s1',
            courseId: 'course-slitlamp',
            title: '2. Goldmann Applanation Tonometry (GAT) for Glaucoma Diagnosis',
            description: 'Fluorescein instillation, cobalt blue filter alignment, aligning the semicircles, and adjusting for central corneal thickness (CCT).',
            videoUrl: 'https://youtu.be/jdOD2G0FDJ4',
            duration: 475,
            durationFormatted: '7:55',
            attachments: [
              { id: 'att-s2', name: 'GAT_Measurement_Protocol.pdf', url: '#', size: '1.1 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 2,
          }
        ]
      },
      {
        id: 'mod-s2',
        courseId: 'course-slitlamp',
        title: 'Module 2: 90D/78D Slit Lamp Fundoscopy',
        order: 2,
        lessons: [
          {
            id: 'les-s3',
            moduleId: 'mod-s2',
            courseId: 'course-slitlamp',
            title: '3. Optic Nerve Head (CD Ratio) & Macular Evaluation with 90D Lens',
            description: 'Holding the high-plus non-contact lens, aligning the light beam, assessing cup-to-disc ratio, ISNT rule, and macular edema detection.',
            videoUrl: 'https://youtu.be/AchZQ2tDcno',
            duration: 196,
            durationFormatted: '3:16',
            attachments: [
              { id: 'att-s3', name: 'Optic_Disc_Glaucoma_Notes.pdf', url: '#', size: '1.9 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 1,
          },
          {
            id: 'les-s4',
            moduleId: 'mod-s2',
            courseId: 'course-slitlamp',
            title: '4. Diabetic Retinopathy & Hypertensive Retinopathy Grading',
            description: 'Identifying microaneurysms, dot-blot hemorrhages, hard exudates, cotton wool spots, and clinically significant macular edema (CSME).',
            videoUrl: 'https://youtu.be/IIE1sIBeL8Q',
            duration: 1076,
            durationFormatted: '17:56',
            attachments: [
              { id: 'att-s4', name: 'Diabetic_Retinopathy_Grading_Chart.pdf', url: '#', size: '1.5 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 2,
          }
        ]
      }
    ]
  },
  {
    id: 'course-glaucoma',
    title: 'Glaucoma Diagnostics, Visual Fields & Laser Iridotomy',
    slug: 'glaucoma-laser-iridotomy',
    shortDescription: 'Angle-closure vs open-angle glaucoma, Humphrey visual field interpretation, and YAG Laser Peripheral Iridotomy (LPI) practical steps.',
    description: 'Comprehensive clinical guide on glaucoma assessment: gonioscopy 4-mirror visualization of trabecular meshwork, Humphrey visual field (HVF) interpretation (MD, PSD, Glaucoma Hemifield Test), and step-by-step Nd:YAG laser iridotomy parameters.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    category: 'Glaucoma & Laser',
    instructor: 'Prof. Dr. M. Hashmi',
    instructorTitle: 'FCPS (Ophthalmology)',
    level: 'Advanced',
    language: 'English',
    published: true,
    order: 3,
    totalLessons: 3,
    totalDuration: 25,
    pricePkr: 7000,
    featured: true,
    createdAt: '2025-02-01T15:00:00Z',
    modules: [
      {
        id: 'mod-g1',
        courseId: 'course-glaucoma',
        title: 'Module 1: Gonioscopy & YAG Laser Iridotomy (LPI)',
        order: 1,
        lessons: [
          {
            id: 'les-g1',
            moduleId: 'mod-g1',
            courseId: 'course-glaucoma',
            title: '1. Gonioscopy Technique & Shaffer Grading of the Anterior Chamber Angle',
            description: 'Visualizing Schwalbe line, trabecular meshwork, scleral spur, and ciliary body band using Goldmann and Sussman goniolenses.',
            videoUrl: 'https://youtu.be/8yTTbHWxUik',
            duration: 273,
            durationFormatted: '4:33',
            attachments: [
              { id: 'att-g1', name: 'Gonioscopy_Shaffer_Grading.pdf', url: '#', size: '1.7 MB', type: 'pdf' }
            ],
            isFreePreview: true,
            order: 1,
          },
          {
            id: 'les-g2',
            moduleId: 'mod-g1',
            courseId: 'course-glaucoma',
            title: '2. Nd:YAG Laser Peripheral Iridotomy (LPI) Live Procedure & Settings',
            description: 'Pre-treatment with pilocarpine & apraclonidine, Abraham lens application, iris crypt selection, energy titration, and checking patency.',
            videoUrl: 'https://youtu.be/Qzp5MmOPGVo',
            duration: 684,
            durationFormatted: '11:24',
            attachments: [
              { id: 'att-g2', name: 'YAG_Laser_Settings_Protocol.pdf', url: '#', size: '1.3 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 2,
          },
          {
            id: 'les-g3',
            moduleId: 'mod-g1',
            courseId: 'course-glaucoma',
            title: '3. Reading Humphrey Visual Field (HVF 24-2) Printouts Step-by-Step',
            description: 'Reliability indices (fixation losses, false positives/negatives), total vs pattern deviation plots, and early glaucomatous scotoma.',
            videoUrl: 'https://youtu.be/dNFfWucfThk',
            duration: 550,
            durationFormatted: '9:10',
            attachments: [
              { id: 'att-g3', name: 'HVF_Interpretation_Pocket_Card.pdf', url: '#', size: '2.1 MB', type: 'pdf' }
            ],
            isFreePreview: false,
            order: 3,
          }
        ]
      }
    ]
  }
];

export const INITIAL_ACCESS_KEYS: AccessKey[] = [
  // Key 1: UNUSED key for Phaco Cataract (Ready for instant test activation)
  {
    id: 'key-test-01',
    plainKey: 'NMA-7F3K-9Q2M-XW4P',
    keyHash: 'hash-nma-7f3k-9q2m-xw4p',
    keyLast4: 'XW4P',
    courseIds: ['course-phaco'],
    validityDays: 180,
    maxDevices: 2,
    status: 'UNUSED',
    intendedName: 'Bilal Hussain (New Trainee)',
    intendedPhone: '+92 301 2345678',
    note: 'Paid via JazzCash TID 99182312 - Ready for student to activate',
    createdBy: 'admin-001',
    createdAt: '2025-03-01T10:00:00Z',
  },
  // Key 2: UNUSED key for ALL COURSES (Bundle)
  {
    id: 'key-test-02',
    plainKey: 'NMA-8A2D-4B9X-K7Y1',
    keyHash: 'hash-nma-8a2d-4b9x-k7y1',
    keyLast4: 'K7Y1',
    courseIds: ['*'], // All courses
    validityDays: 365,
    maxDevices: 2,
    status: 'UNUSED',
    intendedName: 'Dr. Shahbaz Gill',
    intendedPhone: '+92 321 9876543',
    note: 'Bank transfer paid for 3-course bundle package',
    createdBy: 'admin-001',
    createdAt: '2025-03-02T11:30:00Z',
  },
  // Key 3: UNUSED key for Slit-Lamp course
  {
    id: 'key-test-03',
    plainKey: 'NMA-3M9P-2W4X-8R1K',
    keyHash: 'hash-nma-3m9p-2w4x-8r1k',
    keyLast4: '8R1K',
    courseIds: ['course-slitlamp'],
    validityDays: 90,
    maxDevices: 2,
    status: 'UNUSED',
    intendedName: 'Dr. Zainab Tariq',
    intendedPhone: '+92 304 5556677',
    note: 'EasyPaisa TID 7781203',
    createdBy: 'admin-001',
    createdAt: '2025-03-03T09:00:00Z',
  },
  // Key 4: UNUSED key for Glaucoma course
  {
    id: 'key-test-04',
    plainKey: 'NMA-9H4J-6T2V-8B3Y',
    keyHash: 'hash-nma-9h4j-6t2v-8b3y',
    keyLast4: '8B3Y',
    courseIds: ['course-glaucoma'],
    validityDays: 180,
    maxDevices: 2,
    status: 'UNUSED',
    intendedName: '',
    intendedPhone: '',
    note: 'Cash paid at Nishtar Medical Academy Reception',
    createdBy: 'admin-001',
    createdAt: '2025-03-03T14:10:00Z',
  },
  // Key 5: ACTIVE key redeemed by Ahmed Raza
  {
    id: 'key-act-01',
    plainKey: 'NMA-AHM1-PHAC-2025',
    keyHash: 'hash-nma-ahm1-phac-2025',
    keyLast4: '2025',
    courseIds: ['course-phaco'],
    validityDays: 180,
    maxDevices: 2,
    status: 'ACTIVE',
    intendedName: 'Dr. Ahmed Raza',
    intendedPhone: '+92 312 8765432',
    note: 'House Officer at Nishtar Eye Ward - JazzCash',
    createdBy: 'admin-001',
    createdAt: '2025-02-10T08:00:00Z',
    redeemedBy: 'student-001',
    redeemedAt: '2025-02-10T11:00:00Z',
    expiresAt: new Date(Date.now() + 140 * 86400000).toISOString(),
  },
  // Key 6: ACTIVE key redeemed by Ahmed Raza for Slit-Lamp (owns 2 courses)
  {
    id: 'key-act-02',
    plainKey: 'NMA-AHM2-SLIT-2025',
    keyHash: 'hash-nma-ahm2-slit-2025',
    keyLast4: '2025',
    courseIds: ['course-slitlamp'],
    validityDays: 180,
    maxDevices: 2,
    status: 'ACTIVE',
    intendedName: 'Dr. Ahmed Raza',
    intendedPhone: '+92 312 8765432',
    note: 'Second course purchase via EasyPaisa',
    createdBy: 'admin-001',
    createdAt: '2025-02-18T10:00:00Z',
    redeemedBy: 'student-001',
    redeemedAt: '2025-02-18T10:30:00Z',
    expiresAt: new Date(Date.now() + 155 * 86400000).toISOString(),
  },
  // Key 7: ACTIVE key redeemed by Fatima Noor
  {
    id: 'key-act-03',
    plainKey: 'NMA-FAT1-ALLC-2025',
    keyHash: 'hash-nma-fat1-allc-2025',
    keyLast4: '2025',
    courseIds: ['*'],
    validityDays: 365,
    maxDevices: 2,
    status: 'ACTIVE',
    intendedName: 'Dr. Fatima Noor',
    intendedPhone: '+92 333 4567890',
    note: 'All courses package - HBL direct deposit',
    createdBy: 'admin-001',
    createdAt: '2025-02-15T09:00:00Z',
    redeemedBy: 'student-002',
    redeemedAt: '2025-02-15T15:00:00Z',
    expiresAt: new Date(Date.now() + 320 * 86400000).toISOString(),
  },
  // Key 8: EXPIRED key
  {
    id: 'key-exp-01',
    plainKey: 'NMA-EXP1-9988-7766',
    keyHash: 'hash-nma-exp1-9988-7766',
    keyLast4: '7766',
    courseIds: ['course-glaucoma'],
    validityDays: 30,
    maxDevices: 2,
    status: 'EXPIRED',
    intendedName: 'Dr. Usman Khalid',
    intendedPhone: '+92 322 1112233',
    note: '30 days trial key that expired',
    createdBy: 'admin-001',
    createdAt: '2024-12-01T10:00:00Z',
    redeemedBy: 'student-001',
    redeemedAt: '2024-12-01T11:00:00Z',
    expiresAt: '2025-01-01T11:00:00Z',
  },
  // Key 9: REVOKED key
  {
    id: 'key-rev-01',
    plainKey: 'NMA-REV1-4433-2211',
    keyHash: 'hash-nma-rev1-4433-2211',
    keyLast4: '2211',
    courseIds: ['course-phaco'],
    validityDays: 90,
    maxDevices: 1,
    status: 'REVOKED',
    intendedName: 'Suspicious User',
    intendedPhone: '+92 300 0000000',
    note: 'Revoked: Account sharing violation detected',
    createdBy: 'admin-001',
    createdAt: '2025-01-05T08:00:00Z',
    redeemedBy: 'student-001',
    redeemedAt: '2025-01-05T09:00:00Z',
    revokedAt: '2025-01-12T16:00:00Z',
    revokedReason: 'Unauthorized screen sharing detected',
  },
  // Key 10: UNUSED key expiring soon after activation
  {
    id: 'key-test-05',
    plainKey: 'NMA-4P7K-2M9X-8Q3V',
    keyHash: 'hash-nma-4p7k-2m9x-8q3v',
    keyLast4: '8Q3V',
    courseIds: ['course-glaucoma'],
    validityDays: 7,
    maxDevices: 2,
    status: 'UNUSED',
    intendedName: 'Quick Review Trainee',
    intendedPhone: '+92 315 7654321',
    note: '1-week urgent exam preparation key',
    createdBy: 'admin-001',
    createdAt: '2025-03-04T12:00:00Z',
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-ahmed-phaco',
    uid: 'student-001',
    courseId: 'course-phaco',
    keyId: 'key-act-01',
    grantedAt: '2025-02-10T11:00:00Z',
    expiresAt: new Date(Date.now() + 140 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'enr-ahmed-slitlamp',
    uid: 'student-001',
    courseId: 'course-slitlamp',
    keyId: 'key-act-02',
    grantedAt: '2025-02-18T10:30:00Z',
    expiresAt: new Date(Date.now() + 155 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'enr-fatima-all-1',
    uid: 'student-002',
    courseId: 'course-phaco',
    keyId: 'key-act-03',
    grantedAt: '2025-02-15T15:00:00Z',
    expiresAt: new Date(Date.now() + 320 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'enr-fatima-all-2',
    uid: 'student-002',
    courseId: 'course-slitlamp',
    keyId: 'key-act-03',
    grantedAt: '2025-02-15T15:00:00Z',
    expiresAt: new Date(Date.now() + 320 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'enr-fatima-all-3',
    uid: 'student-002',
    courseId: 'course-glaucoma',
    keyId: 'key-act-03',
    grantedAt: '2025-02-15T15:00:00Z',
    expiresAt: new Date(Date.now() + 320 * 86400000).toISOString(),
    active: true,
  },
];

export const INITIAL_PROGRESS: LessonProgress[] = [
  {
    uid: 'student-001',
    lessonId: 'les-p1',
    courseId: 'course-phaco',
    watchedSeconds: 1140,
    completed: true,
    updatedAt: '2025-02-12T14:30:00Z',
  },
  {
    uid: 'student-001',
    lessonId: 'les-p2',
    courseId: 'course-phaco',
    watchedSeconds: 1200,
    completed: false,
    updatedAt: '2025-02-16T18:00:00Z',
  },
  {
    uid: 'student-001',
    lessonId: 'les-s1',
    courseId: 'course-slitlamp',
    watchedSeconds: 1200,
    completed: true,
    updatedAt: '2025-02-20T20:15:00Z',
  }
];

export const INITIAL_NOTES: LessonNote[] = [
  {
    uid: 'student-001',
    lessonId: 'les-p1',
    courseId: 'course-phaco',
    text: 'Barrett Universal II formula is superior for axial lengths > 25.5 mm at Nishtar Medical Academy OT. Always verify keratometry with manual Javal-Schiotz.',
    updatedAt: '2025-02-12T15:00:00Z',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'New Surgical Video Added: Phacoemulsification Stop & Chop Technique',
    body: 'Prof. Dr. M. Hashmi has uploaded the live surgical recording of dense grade 4 nuclear cataract phaco with audio commentary. All enrolled trainees can now view Lesson 5.',
    courseId: 'course-phaco',
    courseName: 'Phacoemulsification Masterclass',
    createdAt: '2025-02-28T09:00:00Z',
    authorName: 'Prof. Dr. M. Hashmi',
  },
  {
    id: 'ann-2',
    title: 'Offline Payment & WhatsApp Access Key Notice',
    body: 'For students enrolling in Cataract Phaco or Slit-Lamp courses, please transfer via JazzCash/EasyPaisa (0300 7312345) and send the receipt to our WhatsApp. Access keys are issued within 10-15 minutes.',
    createdAt: '2025-03-01T12:00:00Z',
    authorName: 'Nishtar Medical Academy Office',
  }
];
