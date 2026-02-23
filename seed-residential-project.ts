/**
 * Residential Project Seed Script
 * Seeds a complete residential project with tasks, BOQ items, and crews
 * Uses the default/demo organization from supabase migrations
 * Run with: npx ts-node seed-residential-project.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

// Try to use service role key for admin operations, fallback to anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Use the default organization from migrations
const ORGANIZATION_ID = '795acdd9-9a69-4699-aaee-2787f7babce0';
const PROJECT_NAME = 'Westlake Residence - 4BR Townhouse';
const PROJECT_LOCATION = 'Westlake, Cape Town, South Africa';

interface SeedData {
  organizationId: string;
  userId: string;
  projectId: string;
  crewIds: Record<string, string>;
  boqItemIds: string[];
  taskIds: string[];
}

const seedData: SeedData = {
  organizationId: ORGANIZATION_ID,
  userId: '',
  projectId: '',
  crewIds: {},
  boqItemIds: [],
  taskIds: [],
};

async function createOrganization() {
  console.log('📦 Creating organization...');
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      id: ORGANIZATION_ID,
      name: 'BuildTech Construction',
      address: 'Cape Town, South Africa',
      contact_number: '+27 21 555 0123',
      email: 'info@buildtech.co.za',
      tin: 'ZA123456789',
    })
    .select()
    .single();

  if (error && error.code !== '23505') throw error; // 23505 = unique constraint
  return data?.id || ORGANIZATION_ID;
}

async function createUser() {
  console.log('👤 Getting current user...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log('⚠️  Using placeholder user ID (set USER_ID in .env)');
    return process.env.VITE_DEMO_USER_ID || randomUUID();
  }

  // Create profile if doesn't exist
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: user.id,
      organization_id: ORGANIZATION_ID,
      email: user.email!,
      full_name: 'Demo Project Manager',
      role: 'project_manager',
    });
  }

  return user.id;
}

async function createProject(userId: string) {
  console.log('🏗️  Creating residential project...');
  
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 180); // 6 months

  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: ORGANIZATION_ID,
      name: PROJECT_NAME,
      location: PROJECT_LOCATION,
      client_name: 'Mr. & Mrs. Smith',
      contract_amount: 2500000,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

async function createCrews(userId: string) {
  console.log('👷 Creating crews...');
  
  const crews = [
    { name: 'Foundation & Structure', foreman: 'Mr. Themba Mthembu' },
    { name: 'Brickwork & Plastering', foreman: 'Mr. Sipho Ndlela' },
    { name: 'Roofing & Cladding', foreman: 'Mr. Moses Khumalo' },
    { name: 'Electrical Installation', foreman: 'Mr. Duane Williams' },
    { name: 'Plumbing & Drainage', foreman: 'Mr. Ravi Patel' },
    { name: 'Painting & Finishes', foreman: 'Mr. Anton Petrov' },
  ];

  const crewIds: Record<string, string> = {};

  for (const crew of crews) {
    const { data, error } = await supabase
      .from('crews')
      .insert({
        organization_id: ORGANIZATION_ID,
        name: crew.name,
        foreman_name: crew.foreman,
        status: 'active',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    crewIds[crew.name] = data.id;
  }

  return crewIds;
}

async function createBOQItems(projectId: string, userId: string) {
  console.log('📋 Creating BOQ items...');

  const boqItems = [
    // Foundation
    { description: 'Excavation & Site Clearing', unit: 'm³', qty: 150, unitRate: 250 },
    { description: 'Concrete Foundation (C20)', unit: 'm³', qty: 45, unitRate: 2500 },
    { description: 'Reinforcement Steel (Y10-Y16)', unit: 'kg', qty: 8000, unitRate: 18 },

    // Brickwork
    { description: 'Face Brick (Common)', unit: 'pcs', qty: 25000, unitRate: 3.50 },
    { description: 'Mortar Mix (Class II)', unit: 'bags', qty: 1200, unitRate: 85 },
    { description: 'Cement Plaster (20mm)', unit: 'm²', qty: 320, unitRate: 95 },

    // Roofing
    { description: 'Roof Timber Structure', unit: 'm²', qty: 280, unitRate: 450 },
    { description: 'Clay Roof Tiles', unit: 'pcs', qty: 18000, unitRate: 8 },
    { description: 'Underlayment & Guttering', unit: 'm', qty: 150, unitRate: 180 },

    // Windows & Doors
    { description: 'Aluminum Window Frames (Anodized)', unit: 'pcs', qty: 12, unitRate: 3500 },
    { description: 'Wooden Door Frames & Doors', unit: 'set', qty: 8, unitRate: 2200 },

    // Electrical
    { description: 'Copper Wiring (2.5-10mm²)', unit: 'm', qty: 4000, unitRate: 35 },
    { description: 'Distribution Board & Breakers', unit: 'set', qty: 1, unitRate: 12000 },
    { description: 'Lighting Fixtures (LED)', unit: 'pcs', qty: 45, unitRate: 580 },

    // Plumbing
    { description: 'PVC Pipes & Fittings (20-50mm)', unit: 'm', qty: 600, unitRate: 65 },
    { description: 'Sanitary Ware (Basin, Toilet, Shower)', unit: 'pcs', qty: 8, unitRate: 2800 },
    { description: 'Hot Water Cylinder (150L)', unit: 'pcs', qty: 1, unitRate: 8500 },

    // Painting & Finishes
    { description: 'Interior Paint (Emulsion)', unit: 'L', qty: 200, unitRate: 180 },
    { description: 'Exterior Paint (Acrylic)', unit: 'L', qty: 150, unitRate: 220 },
    { description: 'Floor Tiles (Ceramic 600x600)', unit: 'm²', qty: 180, unitRate: 450 },
  ];

  const boqItemIds = [];

  for (const item of boqItems) {
    const { data, error } = await supabase
      .from('boq_items')
      .insert({
        project_id: projectId,
        description: item.description,
        unit: item.unit,
        quantity: item.qty,
        unit_rate: item.unitRate,
        amount: item.qty * item.unitRate,
        section: 'General',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    boqItemIds.push(data.id);
  }

  return boqItemIds;
}

async function createScheduleTasks(projectId: string, userId: string, crewIds: Record<string, string>) {
  console.log('📅 Creating schedule tasks...');

  const baseDate = new Date();
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  };

  const tasks = [
    // Planning Phase
    {
      name: 'Project Management Plan',
      phase: 'Planning',
      start: 0,
      duration: 5,
      crew: null,
      status: 'completed' as const,
      progress: 100,
    },
    {
      name: 'Site Survey & Drawings',
      phase: 'Planning',
      start: 0,
      duration: 10,
      crew: null,
      status: 'completed' as const,
      progress: 100,
    },
    {
      name: 'BOQ & Budget Approval',
      phase: 'Planning',
      start: 10,
      duration: 3,
      crew: null,
      status: 'completed' as const,
      progress: 100,
    },

    // Design Phase
    {
      name: 'Detailed Design & Specifications',
      phase: 'Design',
      start: 13,
      duration: 15,
      crew: null,
      status: 'completed' as const,
      progress: 100,
    },
    {
      name: 'Structural Engineering Approval',
      phase: 'Design',
      start: 17,
      duration: 5,
      crew: null,
      status: 'completed' as const,
      progress: 100,
    },

    // Preparation Phase
    {
      name: 'Site Preparation & Fencing',
      phase: 'Preparation',
      start: 28,
      duration: 7,
      crew: 'Foundation & Structure',
      status: 'completed' as const,
      progress: 100,
    },
    {
      name: 'Material Procurement',
      phase: 'Preparation',
      start: 20,
      duration: 15,
      crew: null,
      status: 'in_progress' as const,
      progress: 75,
    },

    // Construction Phase
    {
      name: 'Excavation & Foundation',
      phase: 'Construction',
      start: 35,
      duration: 21,
      crew: 'Foundation & Structure',
      status: 'in_progress' as const,
      progress: 45,
    },
    {
      name: 'Concrete Slab Pouring',
      phase: 'Construction',
      start: 56,
      duration: 7,
      crew: 'Foundation & Structure',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Brickwork - Ground Floor',
      phase: 'Construction',
      start: 63,
      duration: 25,
      crew: 'Brickwork & Plastering',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Brickwork - First Floor',
      phase: 'Construction',
      start: 88,
      duration: 20,
      crew: 'Brickwork & Plastering',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Roof Structure Installation',
      phase: 'Construction',
      start: 108,
      duration: 14,
      crew: 'Roofing & Cladding',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Roof Tiling & Guttering',
      phase: 'Construction',
      start: 122,
      duration: 10,
      crew: 'Roofing & Cladding',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Window & Door Installation',
      phase: 'Construction',
      start: 132,
      duration: 7,
      crew: 'Brickwork & Plastering',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Electrical Rough-in',
      phase: 'Construction',
      start: 88,
      duration: 28,
      crew: 'Electrical Installation',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Plumbing Rough-in',
      phase: 'Construction',
      start: 95,
      duration: 25,
      crew: 'Plumbing & Drainage',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Plastering Walls',
      phase: 'Construction',
      start: 139,
      duration: 18,
      crew: 'Brickwork & Plastering',
      status: 'not_started' as const,
      progress: 0,
    },

    // Finishing Phase
    {
      name: 'Floor Tiling',
      phase: 'Finishing',
      start: 157,
      duration: 20,
      crew: 'Painting & Finishes',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Electrical Final Installation',
      phase: 'Finishing',
      start: 157,
      duration: 12,
      crew: 'Electrical Installation',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Plumbing Final Installation',
      phase: 'Finishing',
      start: 157,
      duration: 10,
      crew: 'Plumbing & Drainage',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Painting - Interior & Exterior',
      phase: 'Finishing',
      start: 177,
      duration: 15,
      crew: 'Painting & Finishes',
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Landscaping & External Works',
      phase: 'Finishing',
      start: 167,
      duration: 12,
      crew: null,
      status: 'not_started' as const,
      progress: 0,
    },

    // Closeout Phase
    {
      name: 'Quality Inspection',
      phase: 'Closeout',
      start: 192,
      duration: 5,
      crew: null,
      status: 'not_started' as const,
      progress: 0,
    },
    {
      name: 'Client Handover & Defects List',
      phase: 'Closeout',
      start: 197,
      duration: 3,
      crew: null,
      status: 'not_started' as const,
      progress: 0,
    },
  ];

  const taskIds = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const startDate = addDays(baseDate, task.start);
    const endDate = addDays(baseDate, task.start + task.duration);

    const { data: createdTask, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        task_name: task.name,
        phase: task.phase,
        planned_start: startDate,
        planned_end: endDate,
        baseline_start: startDate,
        baseline_end: endDate,
        planned_duration: task.duration,
        status: task.status,
        percent_complete: task.progress,
        qty_planned: 1,
        qty_completed: task.progress > 0 ? task.progress / 100 : 0,
        priority: task.phase === 'Planning' ? 'critical' : 'high',
        crew_id: task.crew ? crewIds[task.crew] : null,
        sort_order: i,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    taskIds.push(createdTask.id);
  }

  return taskIds;
}

async function main() {
  try {
    console.log('\n🌱 Starting Residential Project Seed...\n');

    // Use default organization
    console.log(`✅ Using organization: ${ORGANIZATION_ID}`);
    console.log(`   Name: BuildTech Construction\n`);

    // Create user or get current user
    seedData.userId = await createUser();
    console.log(`✅ User ID: ${seedData.userId}\n`);

    // Create project
    seedData.projectId = await createProject(seedData.userId);
    console.log(`✅ Project ID: ${seedData.projectId}`);
    console.log(`   Name: ${PROJECT_NAME}`);
    console.log(`   Location: ${PROJECT_LOCATION}\n`);

    // Create crews
    seedData.crewIds = await createCrews(seedData.userId);
    console.log(`✅ Created ${Object.keys(seedData.crewIds).length} crews\n`);

    // Create BOQ items
    seedData.boqItemIds = await createBOQItems(seedData.projectId, seedData.userId);
    console.log(`✅ Created ${seedData.boqItemIds.length} BOQ items\n`);

    // Create schedule tasks
    seedData.taskIds = await createScheduleTasks(seedData.projectId, seedData.userId, seedData.crewIds);
    console.log(`✅ Created ${seedData.taskIds.length} schedule tasks\n`);

    console.log('═══════════════════════════════════════════');
    console.log('🎉 Seed completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Organization: BuildTech Construction');
    console.log('   Project: ' + PROJECT_NAME);
    console.log(`   User Email: Check server console output`);
    console.log(`   Password: DemoPassword123!\n`);
    console.log('💡 To view the project:');
    console.log('   1. Navigate to /projects');
    console.log('   2. Click on the project');
    console.log('   3. Explore Schedule, BOQ, and other modules\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
