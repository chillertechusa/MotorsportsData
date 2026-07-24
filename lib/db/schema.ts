import { boolean, date, doublePrecision, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

// ── Better Auth tables ────────────────────────────────────────────────────────
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  // Platform-level moderation columns (added migration 006)
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  bannedAt: timestamp('banned_at'),
  // Platform-level role: 'user' | 'coach' | 'admin' | 'owner'
  role: varchar('role', { length: 20 }).default('user'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// ── App enums ─────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'in_production', 'quality_check', 'ready', 'shipped', 'completed', 'cancelled',
])

export const printTypeEnum = pgEnum('print_type', [
  'screen_print', 'embroidery', 'dtf', 'sublimation',
])

// ── App tables ────────────────────────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  customerName: text('customerName').notNull(),
  customerEmail: text('customerEmail').notNull(),
  customerPhone: text('customerPhone'),
  productType: text('productType').notNull(),
  printType: printTypeEnum('printType').notNull().default('screen_print'),
  quantity: integer('quantity').notNull().default(1),
  sizes: text('sizes'),
  colors: text('colors'),
  notes: text('notes'),
  artworkUrl: text('artworkUrl'),
  unitPrice: numeric('unitPrice', { precision: 10, scale: 2 }),
  totalPrice: numeric('totalPrice', { precision: 10, scale: 2 }),
  blankId: integer('blankId'),
  numColors: integer('numColors').default(1),
  printLocations: integer('printLocations').default(1),
  garmentCost: numeric('garmentCost', { precision: 10, scale: 2 }),
  breakdown: jsonb('breakdown'),
  status: orderStatusEnum('status').notNull().default('pending'),
  assignedTo: text('assignedTo'),
  dueDate: timestamp('dueDate'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  basePrice: numeric('basePrice', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  available: boolean('available').notNull().default(true),
  sortOrder: integer('sortOrder').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const raceTeamMembers = pgTable('race_team_members', {
  id: serial('id').primaryKey(),
  gamerTag: text('gamerTag').notNull(),
  realName: text('realName'),
  platform: text('platform').notNull().default('PlayStation'),
  racingNumber: integer('racingNumber'),
  bio: text('bio'),
  avatar: text('avatar'),
  wins: integer('wins').notNull().default(0),
  podiums: integer('podiums').notNull().default(0),
  points: integer('points').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const raceResults = pgTable('race_results', {
  id: serial('id').primaryKey(),
  memberId: integer('memberId').notNull(),
  event: text('event').notNull(),
  track: text('track'),
  position: integer('position'),
  totalRiders: integer('totalRiders'),
  points: integer('points').notNull().default(0),
  raceDate: timestamp('raceDate').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// ── Print shop manufacturing tables ─────────────────────────────────────────
export const blanks = pgTable('blanks', {
  id: serial('id').primaryKey(),
  styleNumber: text('styleNumber').notNull(),
  brand: text('brand').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  wholesaleCost: numeric('wholesaleCost', { precision: 10, scale: 2 }).notNull(),
  colors: text('colors'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const pricingSettings = pgTable('pricing_settings', {
  id: serial('id').primaryKey(),
  screenSetupFee: numeric('screenSetupFee', { precision: 10, scale: 2 }).notNull().default('20.00'),
  colorChangeFee: numeric('colorChangeFee', { precision: 10, scale: 2 }).notNull().default('15.00'),
  sizeTagFee: numeric('sizeTagFee', { precision: 10, scale: 2 }).notNull().default('1.00'),
  defaultMarkup: numeric('defaultMarkup', { precision: 5, scale: 2 }).notNull().default('2.00'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// ── Retail storefront tables ─────────────────────────────────────────────────
export const retailProducts = pgTable('retail_products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  priceCents: integer('priceCents').notNull(),
  images: jsonb('images').notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sortOrder').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const retailVariants = pgTable('retail_variants', {
  id: serial('id').primaryKey(),
  productId: integer('productId').notNull(),
  color: text('color').notNull(),
  size: text('size').notNull(),
  sku: text('sku').notNull().unique(),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const retailOrders = pgTable('retail_orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('orderNumber').notNull().unique(),
  userId: text('userId'),
  email: text('email').notNull(),
  customerName: text('customerName').notNull(),
  phone: text('phone'),
  shipAddress1: text('shipAddress1').notNull(),
  shipAddress2: text('shipAddress2'),
  shipCity: text('shipCity').notNull(),
  shipState: text('shipState').notNull(),
  shipZip: text('shipZip').notNull(),
  subtotalCents: integer('subtotalCents').notNull(),
  shippingCents: integer('shippingCents').notNull().default(0),
  taxCents: integer('taxCents').notNull().default(0),
  totalCents: integer('totalCents').notNull(),
  status: text('status').notNull().default('paid'),
  squarePaymentId: text('squarePaymentId'),
  trackingCarrier: text('trackingCarrier'),
  trackingNumber: text('trackingNumber'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const retailOrderItems = pgTable('retail_order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('orderId').notNull(),
  variantId: integer('variantId'),
  productName: text('productName').notNull(),
  color: text('color').notNull(),
  size: text('size').notNull(),
  unitPriceCents: integer('unitPriceCents').notNull(),
  quantity: integer('quantity').notNull(),
  image: text('image'),
})

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  teeSize: text('teeSize'),
  hoodieSize: text('hoodieSize'),
  raceNumber: text('raceNumber'),
  riderClass: text('riderClass'),
  homeTrack: text('homeTrack'),
  shipAddress1: text('shipAddress1'),
  shipAddress2: text('shipAddress2'),
  shipCity: text('shipCity'),
  shipState: text('shipState'),
  shipZip: text('shipZip'),
  phone: text('phone'),
  smsOptIn: boolean('smsOptIn').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// ── Motorsport Data (MD) platform tables ─────────────────────────────────────
export const mdTeams = pgTable('md_teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('privateer'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  squareCustomerId: varchar('square_customer_id', { length: 255 }),
  riderName: varchar('rider_name', { length: 255 }),
  riderBirthYear: integer('rider_birth_year'),
  riderClass: varchar('rider_class', { length: 100 }),
  expiryAlertSentAt: timestamp('expiry_alert_sent_at', { withTimezone: true }),
  /** Primary discipline: 'mx_sx' | 'enduro' | 'fmx' | 'flat_track' | 'trail' | 'pit_bike' */
  discipline: varchar('discipline', { length: 60 }),
  /** Payment tracking: 'active' | 'failed' | 'past_due' | 'downgraded' */
  paymentStatus: varchar('payment_status', { length: 50 }).default('active'),
  lastPaymentAttempt: timestamp('last_payment_attempt', { withTimezone: true }),
  paymentFailureCount: integer('payment_failure_count').default(0),
  downgradedAt: timestamp('downgraded_at', { withTimezone: true }),
  // ── Recurring subscription (Square Subscriptions API) ──────────────────────
  /** Square Subscription object id — present once a recurring plan is active. */
  squareSubscriptionId: varchar('square_subscription_id', { length: 255 }),
  /** Square Card-on-file id used to auto-charge each billing period. */
  squareCardId: varchar('square_card_id', { length: 255 }),
  /** Square catalog plan-variation id the subscription is bound to. */
  squarePlanVariationId: varchar('square_plan_variation_id', { length: 255 }),
  /** Billing cadence: 'annual' | 'monthly'. */
  billingFrequency: varchar('billing_frequency', { length: 20 }).default('annual'),
  /** True when the member has requested cancellation at period end. */
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  /** Timestamp the subscription was canceled (immediate or scheduled). */
  subscriptionCanceledAt: timestamp('subscription_canceled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Cache of Square catalog subscription plans + variations, keyed by
 * (tier, frequency, environment). Bootstrapped on first checkout so we never
 * re-create catalog objects, and so subscription creation is a fast lookup.
 */
export const mdSquarePlanCatalog = pgTable('md_square_plan_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: varchar('tier', { length: 50 }).notNull(),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  squarePlanId: varchar('square_plan_id', { length: 255 }).notNull(),
  squareVariationId: varchar('square_variation_id', { length: 255 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  environment: varchar('environment', { length: 20 }).notNull().default('production'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Alert engine — configurable push notification thresholds ─────────────────

/**
 * One row per alert type per team. Coaches configure thresholds here.
 * alert_type values: 'hr_spike' | 'hr_drop' | 'hr_sustained_high' |
 *   'readiness_drop' | 'readiness_peaked' | 'assignment_missed' | 'lap_record'
 */
export const mdAlertRules = pgTable('md_alert_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  alertType: varchar('alert_type', { length: 60 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  /** BPM for HR alerts, 0–100 for readiness, minutes for sustained */
  thresholdValue: integer('threshold_value'),
  /** 'above' | 'below' — direction that triggers the alert */
  thresholdDirection: varchar('threshold_direction', { length: 10 }).default('above'),
  /** Minimum seconds between repeated fires for the same rule */
  cooldownSeconds: integer('cooldown_seconds').notNull().default(300),
  lastFiredAt: timestamp('last_fired_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Immutable audit log of every alert that fired. */
export const mdAlertEvents = pgTable('md_alert_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  ruleId: uuid('rule_id').references(() => mdAlertRules.id, { onDelete: 'set null' }),
  alertType: varchar('alert_type', { length: 60 }).notNull(),
  /** Context payload: riderName, bpm, readinessScore, etc. */
  context: jsonb('context').$type<Record<string, unknown>>().default({}),
  pushSent: integer('push_sent').default(0),
  firedAt: timestamp('fired_at', { withTimezone: true }).defaultNow(),
})


export const mdVehicles = pgTable('md_vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  engineHours: doublePrecision('engine_hours').default(0),
  /** Links to lib/md-specs BikeSpec.key for OEM data lookup */
  specKey: varchar('spec_key', { length: 100 }),
  /**
   * Riding discipline — drives AI prompt personalization.
   * Values: 'mx_sx' | 'enduro_gncc' | 'fmx_freestyle' | 'flat_track' | 'trail_recreational' | 'pit_bike_youth'
   */
  discipline: varchar('discipline', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdSessions = pgTable('md_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'cascade' }),
  trackName: varchar('track_name', { length: 255 }).notNull(),
  trackConditions: varchar('track_conditions', { length: 255 }),
  riderFeedback: text('rider_feedback'),
  /** Best lap time recorded this session, in seconds (nullable — not every session is timed) */
  bestLapSeconds: doublePrecision('best_lap_seconds'),
  /** Total run time this session in hours — also advances mdVehicles.engineHours */
  sessionHours: doublePrecision('session_hours').default(0),
  sessionDate: date('session_date').defaultNow(),

  // ── Setup sheet: weather ──────────────────────────────────────────────────
  ambientTempF: integer('ambient_temp_f'),
  humidityPct: integer('humidity_pct'),
  windMph: integer('wind_mph'),
  trackSurface: varchar('track_surface', { length: 80 }),

  // ── Setup sheet: tires ────────────────────────────────────────────────────
  tireFront: varchar('tire_front', { length: 120 }),
  tireRear: varchar('tire_rear', { length: 120 }),
  tirePressureFront: doublePrecision('tire_pressure_front'),
  tirePressureRear: doublePrecision('tire_pressure_rear'),

  // ── Setup sheet: engine / jetting ─────────────────────────────────────────
  fuelMix: varchar('fuel_mix', { length: 80 }),
  jetNeedle: varchar('jet_needle', { length: 80 }),
  airFilterCondition: varchar('air_filter_condition', { length: 80 }),
  engineMap: varchar('engine_map', { length: 80 }),

  // ── Public sharing ───���────────────────────────────────────────────────────
  /** Random URL-safe token used for the public /setups/[token] page */
  shareToken: varchar('share_token', { length: 32 }).unique(),
  isPublic: boolean('is_public').default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdSetupLogs = pgTable('md_setup_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  sessionId: uuid('session_id').references(() => mdSessions.id, { onDelete: 'cascade' }),
  parameterKey: varchar('parameter_key', { length: 255 }).notNull(),
  parameterValue: varchar('parameter_value', { length: 255 }).notNull(),
})

/**
 * Web Push subscriptions for MD. One row per browser/device per user.
 * `endpoint` is unique so the same device does not get duplicate rows.
 * Scoped to a team so a "faster lap" webhook can notify all teammates.
 */
export const mdPushSubscriptions = pgTable('md_push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  keys: jsonb('keys').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Tracks users who visited checkout but never completed a subscription.
 * Written server-side on checkout page load; cleared on successful subscribe.
 * The abandoned-checkout cron reads rows older than 1 hour to send recovery emails.
 */
export const mdAbandonedCheckouts = pgTable('md_abandoned_checkouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  name: text('name'),
  plan: varchar('plan', { length: 50 }).notNull(),
  /** Set to true once the recovery email has been sent — prevents re-sending. */
  emailSent: boolean('email_sent').default(false),
  /** Set to true once the user actually subscribes — prevents sending after conversion. */
  converted: boolean('converted').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdPartVault = pgTable('md_part_vault', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'cascade' }),
  partName: varchar('part_name', { length: 255 }).notNull(),
  currentHours: doublePrecision('current_hours').default(0),
  maxHours: doublePrecision('max_hours').notNull(),
  stockInTruck: integer('stock_in_truck').default(0),
})

export const mdTracks = pgTable('md_tracks', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('USA'),
  /** Center point for map focus [lat, lng] */
  centerLat: doublePrecision('center_lat'),
  centerLng: doublePrecision('center_lng'),
  /** Track type: MOTOCROSS, SUPERCROSS, ENDURO, FLAT_TRACK, FMX, KARTING, RALLY */
  trackType: varchar('track_type', { length: 50 }).default('MOTOCROSS'),
  /** GeoJSON polygon boundary for lap detection { type: "Polygon", coordinates: [[[lng, lat], ...]] } */
  boundary: jsonb('boundary'),
  /** Zoom level for map display */
  zoom: integer('zoom').default(15),
  /** Surface type: DIRT, SAND, MUD, ASPHALT, MIXED */
  surface: varchar('surface', { length: 100 }),
  /** Notable features: ["Start/Finish", "Whoops", "Sand", "Rhythm Section"] */
  features: text('features').array(),
  /** Elevation change in feet */
  elevationChange: integer('elevation_change'),
  /** Approximate lap length in miles */
  lapLengthMiles: doublePrecision('lap_length_miles'),
  source: varchar('source', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdScheduleEvents = pgTable('md_schedule_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull().default('practice'),
  eventDate: date('event_date').notNull(),
  trackId: uuid('track_id').references(() => mdTracks.id, { onDelete: 'set null' }),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  series: varchar('series', { length: 100 }),
  finishPosition: integer('finish_position'),
  seriesResultUrl: text('series_result_url'),
  entryFeeCents: integer('entry_fee_cents').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdExpenses = pgTable('md_expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'set null' }),
  category: varchar('category', { length: 100 }).notNull().default('Other'),
  amountCents: integer('amount_cents').notNull().default(0),
  expenseDate: date('expense_date').notNull(),
  description: text('description'),
  receiptUrl: text('receipt_url'),
  linkedScheduleEventId: uuid('linked_schedule_event_id').references(() => mdScheduleEvents.id, { onDelete: 'set null' }),
  linkedPartVaultId: uuid('linked_part_vault_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdSponsors = pgTable('md_sponsors', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  sponsorName: varchar('sponsor_name', { length: 255 }).notNull(),
  sponsorType: varchar('sponsor_type', { length: 50 }).notNull().default('cash'),
  valueCents: integer('value_cents').notNull().default(0),
  season: varchar('season', { length: 20 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  deliverables: jsonb('deliverables').$type<string[]>().default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdRiderReadiness = pgTable('md_rider_readiness', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  entryDate: date('entry_date').notNull(),
  sleepHours: numeric('sleep_hours', { precision: 4, scale: 1 }),
  sleepScore: integer('sleep_score'),
  hrv: integer('hrv'),
  restingHr: integer('resting_hr'),
  energy: integer('energy'),
  fatigue: integer('fatigue'),
  notes: text('notes'),
  source: varchar('source', { length: 50 }).notNull().default('manual'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdNutritionLog = pgTable('md_nutrition_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  logDate: date('log_date').notNull(),
  mealType: varchar('meal_type', { length: 50 }).notNull().default('meal'),
  foodName: varchar('food_name', { length: 255 }).notNull(),
  quantityGrams: numeric('quantity_grams', { precision: 8, scale: 1 }),
  calories: numeric('calories', { precision: 8, scale: 1 }),
  proteinG: numeric('protein_g', { precision: 8, scale: 1 }),
  carbsG: numeric('carbs_g', { precision: 8, scale: 1 }),
  fatG: numeric('fat_g', { precision: 8, scale: 1 }),
  waterMl: integer('water_ml'),
  fdcId: varchar('fdc_id', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdHydrationLog = pgTable('md_hydration_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  logDate: date('log_date').notNull(),
  preRideWeightKg: numeric('pre_ride_weight_kg', { precision: 5, scale: 2 }),
  postRideWeightKg: numeric('post_ride_weight_kg', { precision: 5, scale: 2 }),
  waterConsumedMl: integer('water_consumed_ml').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdMentalLog = pgTable('md_mental_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  entryDate: date('entry_date').notNull(),
  entryType: varchar('entry_type', { length: 50 }).notNull().default('daily'),
  mood: integer('mood'),
  focus: integer('focus'),
  anxiety: integer('anxiety'),
  confidence: integer('confidence'),
  motivation: integer('motivation'),
  notes: text('notes'),
  linkedScheduleEventId: uuid('linked_schedule_event_id').references(() => mdScheduleEvents.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdInterviewSessions = pgTable('md_interview_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  scenarioType: varchar('scenario_type', { length: 50 }).notNull(),
  questionText: text('question_text').notNull(),
  riderAnswerText: text('rider_answer_text').notNull(),
  aiFeedback: jsonb('ai_feedback').$type<{
    overall: string
    dimensions: { name: string; score: number; feedback: string }[]
    tip: string
  }>(),
  score: integer('score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdInjuries = pgTable('md_injuries', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  bodyRegion: varchar('body_region', { length: 100 }).notNull(),
  injuryType: varchar('injury_type', { length: 100 }).notNull(),
  severity: integer('severity').notNull().default(1),
  incidentDate: date('incident_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  isConcussion: boolean('is_concussion').notNull().default(false),
  rtrStage: integer('rtr_stage').notNull().default(0),
  rtrStageStartedAt: timestamp('rtr_stage_started_at', { withTimezone: true }),
  rtrClearedAt: timestamp('rtr_cleared_at', { withTimezone: true }),
  clearedBy: varchar('cleared_by', { length: 255 }),
  notes: text('notes'),
  linkedScheduleEventId: uuid('linked_schedule_event_id').references(() => mdScheduleEvents.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const mdVideoAnalyses = pgTable('md_video_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  blobUrl: text('blob_url').notNull(),
  blobPathname: text('blob_pathname').notNull(),
  originalFilename: varchar('original_filename', { length: 255 }),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'set null' }),
  linkedScheduleEventId: uuid('linked_schedule_event_id').references(() => mdScheduleEvents.id, { onDelete: 'set null' }),
  riderNotes: text('rider_notes'),
  analysis: jsonb('analysis').$type<{
    summary: string
    coachingPoints: { timestamp: string; category: string; observation: string; recommendation: string }[]
    strengths: string[]
    improvements: string[]
    overallScore: number
  }>(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const mdTeamMembers = pgTable('md_team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  role: varchar('role', { length: 50 }).default('mechanic'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Mechanic Work Orders ──────────────────────────────────────────────────────

/**
 * A work order tracks a discrete job on a specific vehicle.
 * Mechanic team members can create and close these; the team owner can see all.
 * status: open | in_progress | closed
 */
export const mdWorkOrders = pgTable('md_work_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'cascade' }).notNull(),
  assignedMechanicUserId: text('assigned_mechanic_user_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  /** Decimal hours logged by the mechanic */
  laborHours: doublePrecision('labor_hours').default(0),
  laborStartedAt: timestamp('labor_started_at', { withTimezone: true }),
  laborClosedAt: timestamp('labor_closed_at', { withTimezone: true }),
  /** Suspension settings snapshot BEFORE the job — stored as key/value JSON */
  suspensionBefore: jsonb('suspension_before').$type<Record<string, string>>(),
  /** Suspension settings snapshot AFTER the job */
  suspensionAfter: jsonb('suspension_after').$type<Record<string, string>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** Parts consumed during a work order. Links to Part Vault when possible. */
export const mdWorkOrderParts = pgTable('md_work_order_parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id').references(() => mdWorkOrders.id, { onDelete: 'cascade' }).notNull(),
  partVaultId: uuid('part_vault_id').references(() => mdPartVault.id, { onDelete: 'set null' }),
  partName: varchar('part_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitCostCents: integer('unit_cost_cents').default(0),
})

/** Photos attached to a work order, stored as private Vercel Blob pathnames. */
export const mdWorkOrderPhotos = pgTable('md_work_order_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id').references(() => mdWorkOrders.id, { onDelete: 'cascade' }).notNull(),
  /** Blob pathname (not URL) — served via /api/md-work-order-photo route */
  blobPathname: text('blob_pathname').notNull(),
  caption: varchar('caption', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Telemetry devices linked to teams.
 * Supports: MYLAPSTR2, Westhold G3, Anubesport Stella III, RaceBox/LIT Pro,
 * Crossbox CBX20, AiM Solo 2.X / Taipan ECU, Alpinestars Tech-Air MX,
 * In&motion Shot, Garmin HRM-Pro, Polar H10, Apple Watch, and future integrations.
 */
export const mdTelemetryDevices = pgTable('md_telemetry_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Device type: 'mylapstr2' | 'westhold_g3' | 'anubesport_stella' | 'raceboxlitpro' | 'crossbox' | 'aim_solo' | 'alpinestars' | 'inmotionshot' | 'garmin_hrm' | 'polar_h10' | 'apple_watch' etc. */
  deviceType: varchar('device_type', { length: 100 }).notNull(),
  /** Human-readable device name ('My MYLAPSTR2', 'Team Garmin HRM', etc.) */
  friendlyName: varchar('friendly_name', { length: 255 }),
  /** Device-specific credentials or serial (encrypted) — stored as JSON */
  credentials: jsonb('credentials').$type<Record<string, unknown>>(),
  /** Supported formats for this device: CSV, XML, GPX, KML, FIT, TCX, XRK, DRK, Proprietary */
  supportedFormats: jsonb('supported_formats').$type<string[]>(),
  /** Last sync timestamp */
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  /** Active/inactive toggle */
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Telemetry imports from external devices.
 * Tracks all uploaded files and their parsed data for audit/recovery.
 */
export const mdTelemetryImports = pgTable('md_telemetry_imports', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  deviceId: uuid('device_id').references(() => mdTelemetryDevices.id, { onDelete: 'set null' }),
  /** Blob pathname of the original uploaded file */
  sourceBlobPathname: text('source_blob_pathname'),
  /** File format: CSV, XML, GPX, FIT, TCX, etc. */
  fileFormat: varchar('file_format', { length: 20 }).notNull(),
  /** Raw parsed data from the file — device-agnostic schema */
  parsedData: jsonb('parsed_data').$type<Record<string, unknown>>(),
  /** Sessions created or updated from this import (array of session IDs) */
  linkedSessionIds: jsonb('linked_session_ids').$type<string[]>().default([]),
  /** Import status: pending | processing | success | failed */
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  /** Error message if import failed */
  errorMessage: text('error_message'),
  importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
})

/**
 * Coach training templates — IP Vault.
 * Proprietary periodization schedules, heart-rate zones, weekly workload plans.
 * All data encrypted at rest. Riders see assignments but cannot export templates.
 */
export const mdCoachTemplates = pgTable('md_coach_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Template type: 'periodization' | 'hrz_zones' | 'workout' | 'taper' | 'custom' */
  type: varchar('type', { length: 50 }).notNull(),
  /** Template name — appears to team members only */
  name: varchar('name', { length: 255 }).notNull(),
  /** Template content (encrypted JSON) — e.g., week breakdown, HR zones, volume targets */
  encryptedContent: text('encrypted_content').notNull(),
  /** Access level: 'team_only' (riders can't export) | 'coach_only' (locked to coach) */
  accessLevel: varchar('access_level', { length: 50 }).default('team_only'),
  /** Watermark text on UI: "Proprietary — Confidential" */
  displayWatermark: boolean('display_watermark').default(true),
  /** When template was last updated */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Coach template access logs — audit trail for IP Vault.
 * Logs every rider who viewed a template (timestamps, IP address).
 */
export const mdCoachTemplateAccessLog = pgTable('md_coach_template_access_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').references(() => mdCoachTemplates.id, { onDelete: 'cascade' }).notNull(),
  teamMemberId: uuid('team_member_id'),
  /** IP address of accessor */
  ipAddress: varchar('ip_address', { length: 50 }),
  /** User agent (device fingerprint) */
  userAgent: text('user_agent'),
  /** Access action: 'viewed' | 'exported' | 'shared' */
  action: varchar('action', { length: 50 }).notNull(),
  /** Deny reason if action was blocked */
  deniedReason: varchar('denied_reason', { length: 255 }),
  accessedAt: timestamp('accessed_at', { withTimezone: true }).defaultNow(),
})

/**
 * Training assignments from coaches to riders.
 * Riders must acknowledge before the assignment is activated.
 * Used to track compliance: "Did they actually do what they were assigned?"
 */
export const mdCoachAssignments = pgTable('md_coach_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Rider/team member receiving the assignment */
  riderEmail: varchar('rider_email', { length: 255 }).notNull(),
  /** Assignment spec: "40 min cycling at 150 BPM", "2hr trail ride", etc. */
  assignmentSpec: text('assignment_spec').notNull(),
  /** Assigned timestamp (UTC) */
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
  /** Timestamp rider acknowledged (tapped "I acknowledge") — null if not yet acknowledged */
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  /** IP address of acknowledgment */
  acknowledgedIp: varchar('acknowledged_ip', { length: 50 }),
  /** Status: 'pending' | 'acknowledged' | 'completed' | 'failed' | 'skipped' */
  status: varchar('status', { length: 20 }).default('pending'),
  /** When this assignment is due */
  dueAt: timestamp('due_at', { withTimezone: true }),
  /** Linked telemetry import ID (if rider uploaded data post-assignment) */
  linkedTelemetryId: uuid('linked_telemetry_id'),
  /** Compliance result: 'COMPLIANT' | 'FAILED' | 'PENDING' */
  complianceResult: varchar('compliance_result', { length: 20 }),
  /** Notes from coach on compliance assessment */
  complianceNotes: text('compliance_notes'),
})

/**
 * One-time owner recovery backup codes.
 * Generated in batches of 10 from the owner console. Each 8-digit code is stored
 * as a peppered SHA-256 hash and can be used exactly once to reset the owner
 * password when locked out (no email required). Generating a new batch invalidates
 * the previous batch.
 */
export const mdOwnerBackupCodes = pgTable('md_owner_backup_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Owner email the code belongs to */
  ownerEmail: text('owner_email').notNull(),
  /** Display index within the batch (1-10) */
  label: integer('label').notNull(),
  /** Peppered SHA-256 hash of the raw 8-digit code — raw code is never stored */
  codeHash: text('code_hash').notNull(),
  /** True once the code has been redeemed — enforces single use */
  used: boolean('used').notNull().default(false),
  /** Timestamp the code was redeemed */
  usedAt: timestamp('used_at', { withTimezone: true }),
  /** Groups the 10 codes generated together so old batches can be cleared */
  batchId: uuid('batch_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Championship series tracking — one row per series a team is following.
 * e.g. "2025 AMA Supercross 450", "2025 Pro Motocross 250"
 */
export const mdChampionshipSeries = pgTable('md_championship_series', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  seriesName: varchar('series_name', { length: 200 }).notNull(),
  discipline: varchar('discipline', { length: 100 }).notNull().default('supercross'),
  year: integer('year').notNull(),
  currentRound: integer('current_round').notNull().default(1),
  totalRounds: integer('total_rounds').notNull().default(17),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Per-rider standings rows within a championship series.
 * Coaches update these manually after each round.
 */
export const mdChampionshipStandings = pgTable('md_championship_standings', {
  id: uuid('id').defaultRandom().primaryKey(),
  seriesId: uuid('series_id').references(() => mdChampionshipSeries.id, { onDelete: 'cascade' }).notNull(),
  rank: integer('rank').notNull(),
  riderName: varchar('rider_name', { length: 255 }).notNull(),
  riderNumber: integer('rider_number'),
  teamName: varchar('team_name', { length: 255 }),
  points: integer('points').notNull().default(0),
  /** Last round result, e.g. "1st", "DNF", "4th" */
  lastResult: varchar('last_result', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Immutable audit log for all assignment acknowledgments and completions.
 * Legal-weight proof that rider saw and acknowledged the assignment.
 */
export const mdAssignmentAuditLog = pgTable('md_assignment_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').references(() => mdCoachAssignments.id, { onDelete: 'cascade' }).notNull(),
  /** Action: 'assigned' | 'acknowledged' | 'telemetry_uploaded' | 'compliance_assessed' | 'skipped' */
  action: varchar('action', { length: 50 }).notNull(),
  /** IP address of actor */
  ipAddress: varchar('ip_address', { length: 50 }),
  /** User agent for device fingerprinting */
  userAgent: text('user_agent'),
  /** Event details (JSON) — e.g., { "acknowledgedAt": "2026-07-10T14:32:00Z", "riderEmail": "rider@domain.com" } */
  eventData: jsonb('event_data').$type<Record<string, unknown>>(),
  /** Timestamp of action (immutable) */
  actionAt: timestamp('action_at', { withTimezone: true }).defaultNow(),
})

// ── Terra API integration — live heart rate monitoring ────────────────────────

/**
 * Terra API connections — one row per rider/team member who has connected
 * their wearable device via Terra. Stores latest HR reading for live monitoring.
 *
 * Terra is the health data aggregation layer that supports 500+ wearables
 * (Garmin, Polar, Apple Watch, Whoop, Oura, Fitbit, etc.).
 * Setup: add TERRA_API_KEY + TERRA_DEV_ID + TERRA_WEBHOOK_SECRET env vars.
 */
export const mdTerraConnections = pgTable('md_terra_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** MD platform user_id (Better Auth) */
  userId: text('user_id').notNull(),
  /** Terra's internal user identifier, set after OAuth completes */
  terraUserId: varchar('terra_user_id', { length: 255 }).unique(),
  /** Opaque reference ID we pass to Terra so we can match their callback */
  referenceId: varchar('reference_id', { length: 255 }),
  /** Human-readable label for this connection (rider name) */
  riderName: varchar('rider_name', { length: 255 }),
  /** Device provider, e.g. 'GARMIN', 'POLAR', 'APPLE' */
  provider: varchar('provider', { length: 100 }),
  /** Latest HR reading (BPM) from Terra webhook */
  latestHr: integer('latest_hr'),
  /** When the latest HR was received */
  latestHrAt: timestamp('latest_hr_at', { withTimezone: true }),
  /** Rolling 60-second HR history: [{ts: number, hr: number}] */
  hrHistory: jsonb('hr_history').$type<{ ts: number; hr: number }[]>().default([]),
  /** When Terra OAuth completed */
  connectedAt: timestamp('connected_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Session metrics aggregation for analytics.
 * Computed on session completion: lap times, improvements, setup effectiveness, etc.
 */
export const mdSessionMetrics = pgTable('md_session_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => mdSessions.id, { onDelete: 'cascade' }).notNull(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Rider email/name for quick lookup */
  riderEmail: varchar('rider_email', { length: 255 }),
  /** Best lap in seconds */
  bestLapSeconds: doublePrecision('best_lap_seconds'),
  /** Average lap in seconds */
  avgLapSeconds: doublePrecision('avg_lap_seconds'),
  /** Lap-to-lap improvement trend: -1 (getting worse), 0 (flat), 1 (improving) */
  improvementTrend: integer('improvement_trend'),
  /** Setup change applied: true if mdSetupLogs exist for this session */
  setupChanged: boolean('setup_changed').default(false),
  /** Delta vs. previous session best lap (seconds, negative = faster) */
  deltaVsPrevious: doublePrecision('delta_vs_previous'),
  /** Physical readiness score at session time (0–100) */
  readinessScore: integer('readiness_score'),
  /** Session difficulty: 'easy' | 'moderate' | 'hard' | 'peak' */
  difficulty: varchar('difficulty', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Team performance metrics aggregated weekly for trends.
 * Coaches use this to monitor team progress over time.
 */
export const mdTeamAnalytics = pgTable('md_team_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Start of the week (ISO 8601) */
  weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
  /** Session count this week */
  sessionCount: integer('session_count').default(0),
  /** Average best lap time across all sessions this week */
  avgBestLap: doublePrecision('avg_best_lap'),
  /** Fastest rider (email) this week */
  fastestRider: varchar('fastest_rider', { length: 255 }),
  /** Fastest lap time recorded this week */
  fastestLapOverall: doublePrecision('fastest_lap_overall'),
  /** Rider with most improvement this week */
  mostImproving: varchar('most_improving', { length: 255 }),
  /** Average readiness score across team this week */
  avgReadiness: doublePrecision('avg_readiness'),
  /** Setup changes made this week */
  setupChanges: integer('setup_changes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Coach effectiveness metrics for performance tracking.
 * Updated when sessions complete; helps justify coaching ROI.
 */
export const mdCoachEffectiveness = pgTable('md_coach_effectiveness', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  coachEmail: varchar('coach_email', { length: 255 }).notNull(),
  /** Sessions coached by this coach */
  sessionsCoached: integer('sessions_coached').default(0),
  /** Average readiness score accuracy (0–100, how often peak prediction matches race results) */
  readinessAccuracy: doublePrecision('readiness_accuracy'),
  /** Riders who improved under this coach (count) */
  ridersImproved: integer('riders_improved').default(0),
  /** Average lap time improvement per rider (seconds, positive = faster) */
  avgLapImprovement: doublePrecision('avg_lap_improvement'),
  /** Setup recommendations made */
  setupRecommendations: integer('setup_recommendations').default(0),
  /** Setup recommendations that led to improvement */
  successfulSetupChanges: integer('successful_setup_changes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Live race sessions — real-time telemetry streaming.
 * Active only during race day; maps to mdSessions but tracks live state.
 */
export const mdLiveSessions = pgTable('md_live_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Reference to the main mdSessions record */
  sessionId: uuid('session_id').references(() => mdSessions.id, { onDelete: 'cascade' }).notNull(),
  /** Team this live session belongs to (denormalized for RLS) */
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Rider email (denormalized for queries) */
  riderEmail: varchar('rider_email', { length: 255 }).notNull(),
  /** Device ID streaming data (RaceBox, AiM, etc.) */
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  /** Auth token for device to push telemetry */
  sessionToken: varchar('session_token', { length: 512 }).notNull(),
  /** Is the session currently streaming? */
  isActive: boolean('is_active').default(true),
  /** When the live stream started */
  streamStartedAt: timestamp('stream_started_at', { withTimezone: true }).defaultNow(),
  /** Current lap number */
  currentLap: integer('current_lap').default(0),
  /** Total laps completed so far */
  totalLaps: integer('total_laps').default(0),
  /** Best lap time in seconds (updated live) */
  bestLapSeconds: doublePrecision('best_lap_seconds'),
  /** Current lap start time */
  lapStartTime: timestamp('lap_start_time', { withTimezone: true }),
  /** Current session duration in seconds */
  sessionDurationSeconds: integer('session_duration_seconds').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Live telemetry data points — high-frequency streaming data.
 * Partition by session for performance; older partitions can be purged.
 */
export const mdLiveTelemetry = pgTable('md_live_telemetry', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Reference to live session */
  liveSessionId: uuid('live_session_id').references(() => mdLiveSessions.id, { onDelete: 'cascade' }).notNull(),
  /** Millisecond timestamp from device */
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  /** Lap number when this point was recorded */
  lapNumber: integer('lap_number').notNull(),
  /** Lap time in seconds (null if mid-lap) */
  lapTimeSeconds: doublePrecision('lap_time_seconds'),
  /** Current speed in km/h */
  speed: doublePrecision('speed').notNull(),
  /** Throttle position 0-100% */
  throttle: doublePrecision('throttle').notNull(),
  /** Brake pressure (varies by device; normalized 0-100) */
  brakePressure: doublePrecision('brake_pressure'),
  /** Front tire pressure (PSI or bar, as reported) */
  tirePressFront: doublePrecision('tire_press_front'),
  /** Rear tire pressure */
  tirePressRear: doublePrecision('tire_press_rear'),
  /** Engine coolant temperature (°C) */
  engineTempC: doublePrecision('engine_temp_c'),
  /** Engine RPM (in thousands, e.g., 14.5 = 14,500 RPM) */
  engineRpmK: doublePrecision('engine_rpm_k'),
  /** Lateral G-force */
  gLateral: doublePrecision('g_lateral'),
  /** Longitudinal G-force */
  gLongitudinal: doublePrecision('g_longitudinal'),
  /** Front suspension travel (mm, optional) */
  suspensionTravelFront: doublePrecision('suspension_travel_front'),
  /** Rear suspension travel (mm, optional) */
  suspensionTravelRear: doublePrecision('suspension_travel_rear'),
  /** GPS latitude (optional, for map overlay) */
  gpsLat: doublePrecision('gps_lat'),
  /** GPS longitude */
  gpsLon: doublePrecision('gps_lon'),
  /** Device-reported timestamp (milliseconds since epoch, for sync validation) */
  deviceTimestamp: numeric('device_timestamp', { precision: 20, scale: 0 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Live alerts — real-time warnings during race.
 * Triggered by Coach AI based on live telemetry anomalies.
 */
/** Alert threshold configuration per team */
export const mdAlertThresholds = pgTable('md_alert_thresholds', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Team this config belongs to */
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** TIRE_TEMP_HIGH: warn at (°C), critical at (°C) */
  tireTempHighWarn: integer('tire_temp_high_warn').default(100),
  tireTempHighCritical: integer('tire_temp_high_critical').default(110),
  /** ENGINE_TEMP_HIGH: warn at (°C), critical at (°C) */
  engineTempHighWarn: integer('engine_temp_high_warn').default(105),
  engineTempHighCritical: integer('engine_temp_high_critical').default(120),
  /** PACE_DROP: warn if last 3 laps > N seconds slower than best */
  paceDropWarnSeconds: doublePrecision('pace_drop_warn_seconds').default(2.0),
  paceDropCriticalSeconds: doublePrecision('pace_drop_critical_seconds').default(4.0),
  /** Brake pressure drop (psi): warn > N%, critical > N% */
  brakeFadeWarnPercent: integer('brake_fade_warn_percent').default(20),
  brakeFadeCriticalPercent: integer('brake_fade_critical_percent').default(35),
  /** Fuel level low: warn at N%, critical at N% */
  fuelLowWarnPercent: integer('fuel_low_warn_percent').default(25),
  fuelLowCriticalPercent: integer('fuel_low_critical_percent').default(10),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const mdLiveAlerts = pgTable('md_live_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Reference to live session */
  liveSessionId: uuid('live_session_id').references(() => mdLiveSessions.id, { onDelete: 'cascade' }).notNull(),
  /** Alert type: TIRE_TEMP, ENGINE_OVERHEAT, BRAKE_FADE, LAP_DELTA, PACE_DROP, HYDRATION */
  alertType: varchar('alert_type', { length: 100 }).notNull(),
  /** Alert severity: INFO, WARNING, CRITICAL */
  severity: varchar('severity', { length: 50 }).notNull(),
  /** Human-readable message */
  message: text('message').notNull(),
  /** Telemetry data that triggered the alert */
  triggerData: jsonb('trigger_data'),
  /** AI recommendation to fix the issue */
  recommendation: text('recommendation'),
  /** Has the coach acknowledged this alert? */
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Mechanic Portfolio & Optimization Tracking ──────────────────────────────────

/** Mechanic portfolio — tracks mechanic's career, performance stats, verification status */
export const mdMechanicPortfolio = pgTable('md_mechanic_portfolio', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').unique().notNull(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  bio: text('bio'),
  totalRidersServed: integer('total_riders_served').default(0),
  totalLapTimeSavings: doublePrecision('total_lap_time_savings').default(0),
  averageEfficiencyScore: doublePrecision('average_efficiency_score').default(0),
  totalWorkOrders: integer('total_work_orders').default(0),
  verificationStatus: varchar('verification_status', { length: 50 }).default('unverified'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Mechanic optimizations — tracks every setup change with before/after and performance delta */
export const mdMechanicOptimizations = pgTable('md_mechanic_optimizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  mechanicUserId: text('mechanic_user_id').notNull(),
  vehicleId: uuid('vehicle_id').references(() => mdVehicles.id, { onDelete: 'cascade' }).notNull(),
  workOrderId: uuid('work_order_id').references(() => mdWorkOrders.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => mdSessions.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  parameter: varchar('parameter', { length: 255 }).notNull(),
  valueBefore: varchar('value_before', { length: 255 }).notNull(),
  valueAfter: varchar('value_after', { length: 255 }).notNull(),
  rationale: text('rationale'),
  estimatedLapTimeDelta: doublePrecision('estimated_lap_time_delta'),
  actualLapTimeDelta: doublePrecision('actual_lap_time_delta'),
  accuracy: doublePrecision('accuracy'),
  status: varchar('status', { length: 50 }).default('suggested'),
  appliedAt: timestamp('applied_at', { withTimezone: true }),
  evaluatedAt: timestamp('evaluated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Revenue & Conversion Tracking ─────────────────────────────────────��──────

/** Conversion funnel events — tracks visitor → signup → paid journey */
export const mdConversionEvents = pgTable('md_conversion_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  step: varchar('step', { length: 50 }).notNull(),
  sourcePage: varchar('source_page', { length: 255 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** Subscription events — tier changes, upgrades, downgrades, cancellations */
export const mdSubscriptionEvents = pgTable('md_subscription_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  fromTier: varchar('from_tier', { length: 50 }),
  toTier: varchar('to_tier', { length: 50 }),
  amountCents: integer('amount_cents'),
  billingPeriod: varchar('billing_period', { length: 20 }),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** Feature gates — control access to premium features by tier */
export const mdFeatureGates = pgTable('md_feature_gates', {
  id: uuid('id').defaultRandom().primaryKey(),
  featureKey: varchar('feature_key', { length: 100 }).unique().notNull(),
  featureName: varchar('feature_name', { length: 255 }).notNull(),
  description: text('description'),
  minTier: varchar('min_tier', { length: 50 }).notNull(),
  upsellTier: varchar('upsell_tier', { length: 50 }).notNull(),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Feature gate access logs — tracks feature gate attempts and modal triggers */
export const mdFeatureGateLogs = pgTable('md_feature_gate_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  accessGranted: boolean('access_granted').notNull(),
  triggeredModal: boolean('triggered_modal').default(false),
  clickedUpgrade: boolean('clicked_upgrade').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── API Marketplace ────────────────────────────────────────────────────────
/** API keys for third-party integrations */
export const mdApiKeys = pgTable('md_api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  keyName: varchar('key_name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(), // bcrypt hash
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(), // first 20 chars for display
  scope: text('scope').notNull().default('api:read'), // api:read, api:write, webhook:read, webhook:write
  rateLimit: integer('rate_limit').notNull().default(500), // req/min
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // null = never expires
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Webhook subscriptions for event delivery */
export const mdWebhooks = pgTable('md_webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  events: text('events').notNull(), // JSON array: ['telemetry:received', 'session:completed', 'analysis:ready']
  secret: varchar('secret', { length: 255 }).notNull(), // for HMAC-SHA256 signatures
  active: boolean('active').notNull().default(true),
  retryAttempts: integer('retry_attempts').notNull().default(3),
  retryDelay: integer('retry_delay').notNull().default(5000), // milliseconds
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Webhook delivery logs and retry tracking */
export const mdWebhookLogs = pgTable('md_webhook_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  webhookId: uuid('webhook_id').references(() => mdWebhooks.id, { onDelete: 'cascade' }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  statusCode: integer('status_code'),
  responseTime: integer('response_time'), // milliseconds
  error: text('error'),
  attempt: integer('attempt').notNull().default(1),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  success: boolean('success').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** API usage tracking for billing and analytics */
export const mdApiUsage = pgTable('md_api_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  apiKeyId: uuid('api_key_id').references(() => mdApiKeys.id, { onDelete: 'cascade' }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(), // /api/v1/sessions, /api/v1/telemetry, etc
  method: varchar('method', { length: 10 }).notNull(), // GET, POST, etc
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time').notNull(), // milliseconds
  requestCount: integer('request_count').notNull().default(1),
  requestSize: integer('request_size'), // bytes
  responseSize: integer('response_size'), // bytes
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Analytics Event Tracking ──────────────────────────────────────────────────
/** Platform-wide analytics events for usage tracking and dashboards */
export const mdAnalyticsEvents = pgTable('md_analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'signup' | 'checkout' | 'tier_upgrade' | 'team_invite' | 'member_added'
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'set null' }),
  tier: varchar('tier', { length: 50 }), // 'rookie' | 'privateer' | 'race_team' | etc (captured at time of event)
  billingFrequency: varchar('billing_frequency', { length: 20 }), // 'annual' | 'monthly'
  amountCents: integer('amount_cents'), // revenue in cents
  metadata: jsonb('metadata'), // extra event data (checkout_id, payment_status, etc)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** Daily aggregated metrics for fast dashboard queries */
export const mdAnalyticsDailyMetrics = pgTable('md_analytics_daily_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  metricDate: date('metric_date').notNull(),
  signups: integer('signups').default(0),
  checkouts: integer('checkouts').default(0),
  revenueCents: integer('revenue_cents').default(0),
  activeSubscriptions: integer('active_subscriptions').default(0),
  tierDistribution: jsonb('tier_distribution'), // { 'rookie': 10, 'privateer': 5, ... }
  billingFrequencyDistribution: jsonb('billing_frequency_distribution'), // { 'annual': 8, 'monthly': 7 }
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Incident Management & Alerting ───────────────────────────────────────────
/** Incidents triggered when health checks fail persistently */
export const mdIncidents = pgTable('md_incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  checkType: varchar('check_type', { length: 50 }).notNull(), // 'signup' | 'checkout' | 'signin' | 'account_creation' | 'data_isolation'
  severity: varchar('severity', { length: 20 }).notNull(), // 'critical' | 'warning' | 'info'
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'resolved' | 'acknowledged'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  errorMessage: text('error_message'),
  lastOccurredAt: timestamp('last_occurred_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  acknowledgedBy: text('acknowledged_by'),
  failureCount: integer('failure_count').default(1),
  metadata: jsonb('metadata'), // { 'response_time_ms': 5000, 'endpoint': '/api/checkout', ... }
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Alert rules configure when and how to notify on health check failures */
export const mdIncidentAlertRules = pgTable('md_incident_alert_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  checkType: varchar('check_type', { length: 50 }).notNull(), // which health check triggers this
  condition: varchar('condition', { length: 50 }).notNull(), // 'status_failed' | 'response_time_exceeded' | 'consecutive_failures'
  threshold: integer('threshold'), // failure count, milliseconds, etc
  enabled: boolean('enabled').default(true),
  notifySlack: boolean('notify_slack').default(false),
  notifyEmail: boolean('notify_email').default(false),
  slackChannel: varchar('slack_channel', { length: 255 }), // '#incidents' or '#operations'
  slackWebhookUrl: text('slack_webhook_url'), // encrypted in practice
  emailRecipients: jsonb('email_recipients'), // ['owner@example.com', 'ops@example.com']
  cooldownMinutes: integer('cooldown_minutes').default(15), // don't repeat alerts within this window
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/** Alert history - log every alert sent */
export const mdIncidentAlertHistory = pgTable('md_incident_alert_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  incidentId: uuid('incident_id').references(() => mdIncidents.id, { onDelete: 'cascade' }),
  alertRuleId: uuid('alert_rule_id').references(() => mdIncidentAlertRules.id, { onDelete: 'set null' }),
  channel: varchar('channel', { length: 50 }).notNull(), // 'slack' | 'email' | 'webhook'
  recipient: varchar('recipient', { length: 255 }), // channel name or email
  status: varchar('status', { length: 20 }).notNull(), // 'sent' | 'failed' | 'acknowledged'
  message: text('message'),
  responseCode: integer('response_code'), // HTTP response for webhook/API calls
  errorReason: text('error_reason'), // why it failed
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/** Runbooks - remediation guides for each incident type */
export const mdRunbooks = pgTable('md_runbooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  checkType: varchar('check_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  steps: jsonb('steps').notNull(), // [{ "step": 1, "action": "Check database connection", "command": "SELECT 1;" }, ...]
  estimatedTimeMinutes: integer('estimated_time_minutes'),
  automatable: boolean('automatable').default(false), // can this be auto-remediated?
  autoRemedyScript: text('auto_remedy_script'), // shell script or function to auto-fix
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// System Health Results (Layer 3: meta-monitoring of the health-check system)
export const mdSystemHealthResults = pgTable('md_system_health_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  checkType: varchar('check_type', { length: 50 }).notNull().default('system_health'),
  status: varchar('status', { length: 20 }).notNull(), // 'pass' | 'warning' | 'fail'
  message: text('message'),
  responseTimeMs: integer('response_time_ms'),
  // System health metrics
  cronExecutionHealthy: boolean('cron_execution_healthy').default(false),
  cronLastRunAgeMinutes: integer('cron_last_run_age_minutes'),
  incidentCreationHealthy: boolean('incident_creation_healthy').default(false),
  alertRulesAccessible: boolean('alert_rules_accessible').default(false),
  alertDeliveryHealthy: boolean('alert_delivery_healthy').default(false),
  databaseResponsive: boolean('database_responsive').default(false),
  errorDetails: jsonb('error_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Platform Expansion: External Accounts (WS1) ───────────────────────────────
/**
 * External (non-team) monetized accounts: agent | sponsor | promoter | brand_partner.
 * ACCESS IS THE PRODUCT — billing_status is the hard entitlement gate. An account with
 * billing_status other than 'active' (and not is_comped) may NOT read any rider data.
 */
export const mdExternalAccounts = pgTable('md_external_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // Better Auth user id — one login per external account
  accountType: varchar('account_type', { length: 30 }).notNull(), // 'agent' | 'sponsor' | 'promoter' | 'brand_partner'
  orgName: varchar('org_name', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  bio: text('bio'),
  logoUrl: text('logo_url'),
  billingStatus: varchar('billing_status', { length: 30 }).notNull().default('none'), // 'none' | 'trialing' | 'active' | 'past_due' | 'canceled'
  planTier: varchar('plan_tier', { length: 50 }),
  billingFrequency: varchar('billing_frequency', { length: 20 }).default('annual'),
  seatIncludedRiders: integer('seat_included_riders').default(3), // agents: riders included in base seat
  squareCustomerId: varchar('square_customer_id', { length: 255 }),
  squareSubscriptionId: varchar('square_subscription_id', { length: 255 }),
  isComped: boolean('is_comped').notNull().default(false), // owner-comped launch partner (still gated, but access allowed)
  verificationStatus: varchar('verification_status', { length: 30 }).notNull().default('pending'), // 'pending' | 'verified' | 'rejected'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Consent-based data-access link between an external account and a rider (team).
 * Rider/team owner GRANTS access — nothing is visible without status='granted'.
 */
export const mdExternalAccessGrants = pgTable('md_external_access_grants', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalAccountId: uuid('external_account_id').notNull().references(() => mdExternalAccounts.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').notNull().references(() => mdTeams.id, { onDelete: 'cascade' }),
  riderUserId: text('rider_user_id'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'granted' | 'revoked' | 'expired'
  requestedBy: varchar('requested_by', { length: 20 }).notNull().default('external'), // 'external' | 'rider' | 'owner'
  scope: jsonb('scope').notNull().default({}), // what data this grant exposes (results, telemetry, setups, etc.)
  billable: boolean('billable').notNull().default(true),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  creditAwardedCents: integer('credit_awarded_cents').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Shared audit log for the SENTINEL SQUAD — one engine, four lenses:
 * 'access' | 'consent' | 'ip' | 'security'. Detect + log + alert (no auto-block).
 */
export const mdSecurityEvents = pgTable('md_security_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  sentinel: varchar('sentinel', { length: 20 }).notNull(), // 'access' | 'consent' | 'ip' | 'security'
  eventType: varchar('event_type', { length: 60 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('info'), // 'info' | 'warning' | 'critical'
  actorUserId: text('actor_user_id'),
  externalAccountId: uuid('external_account_id').references(() => mdExternalAccounts.id, { onDelete: 'set null' }),
  teamId: uuid('team_id'),
  targetRef: text('target_ref'),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: text('user_agent'),
  detail: jsonb('detail').notNull().default({}),
  detectedBy: varchar('detected_by', { length: 20 }).notNull().default('inline'), // 'inline' | 'sweep'
  acknowledged: boolean('acknowledged').notNull().default(false),
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Ledger of platform credit earned by riders who CONSENT to external data access.
 * "Aggressive but fair" — the people generating the data participate in what it earns.
 */
export const mdRiderCredits = pgTable('md_rider_credits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  teamId: uuid('team_id'),
  grantId: uuid('grant_id').references(() => mdExternalAccessGrants.id, { onDelete: 'set null' }),
  amountCents: integer('amount_cents').notNull(),
  reason: varchar('reason', { length: 60 }).notNull(), // 'consent_grant' | 'data_license_share' | 'adjustment'
  balanceAfterCents: integer('balance_after_cents'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Platform Expansion: Legal & Consent (WS2) ─────────────────────────────────
/**
 * Version registry for legal documents (terms | privacy | data_consent | cookies).
 * is_current marks the version currently in force; status='draft' means DRAFT
 * pending attorney review. Consent is always recorded against a specific version.
 */
export const mdLegalDocuments = pgTable('md_legal_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  docKey: varchar('doc_key', { length: 40 }).notNull(), // 'terms' | 'privacy' | 'data_consent' | 'cookies'
  version: varchar('version', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published'
  isCurrent: boolean('is_current').notNull().default(false),
  requiresAcceptance: boolean('requires_acceptance').notNull().default(true),
  effectiveDate: date('effective_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Immutable, versioned acceptance log. Every acceptance stores the exact doc
 * version, timestamp, IP, and user agent. consent_basis='guardian' rows carry the
 * guardian's identity (COPPA verifiable parental consent for under-13 riders).
 */
export const mdConsentRecords = pgTable('md_consent_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  docKey: varchar('doc_key', { length: 40 }).notNull(),
  docVersion: varchar('doc_version', { length: 20 }).notNull(),
  consentBasis: varchar('consent_basis', { length: 20 }).notNull().default('self'), // 'self' | 'guardian'
  guardianUserId: text('guardian_user_id'),
  guardianName: varchar('guardian_name', { length: 255 }),
  guardianEmail: varchar('guardian_email', { length: 255 }),
  guardianRelationship: varchar('guardian_relationship', { length: 60 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Per-user compliance state: DOB, age bracket, and COPPA/guardian status.
 * requires_guardian + coppa_status gate under-13 riders until verifiable parental
 * consent is captured. One row per user.
 */
export const mdUserCompliance = pgTable('md_user_compliance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  dateOfBirth: date('date_of_birth'),
  birthYear: integer('birth_year'),
  ageAtSignup: integer('age_at_signup'),
  ageBracket: varchar('age_bracket', { length: 20 }), // 'under_13' | 'teen_13_15' | 'teen_16_17' | 'adult'
  isMinor: boolean('is_minor').notNull().default(false),
  requiresGuardian: boolean('requires_guardian').notNull().default(false),
  coppaStatus: varchar('coppa_status', { length: 30 }).notNull().default('not_applicable'), // 'not_applicable' | 'guardian_consent_pending' | 'guardian_consent_verified'
  guardianUserId: text('guardian_user_id'),
  guardianName: varchar('guardian_name', { length: 255 }),
  guardianEmail: varchar('guardian_email', { length: 255 }),
  guardianRelationship: varchar('guardian_relationship', { length: 60 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Platform Expansion: Advisor Agents (WS4) ──────────────────────────────────
/**
 * One row per advisor run (growth | revenue | retention | data_asset). Advisors
 * EVALUATE + RECOMMEND (vs. Sentinels which only alert). Metrics are computed by
 * deterministic DB queries; headline/summary/recommendations are synthesized by a
 * cheap scheduled LLM call (with a rule-based fallback). health_signal drives the
 * console color (good | watch | risk).
 */
export const mdAdvisorReports = pgTable('md_advisor_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  advisorKey: varchar('advisor_key', { length: 30 }).notNull(), // 'growth' | 'revenue' | 'retention' | 'data_asset'
  period: varchar('period', { length: 20 }).notNull().default('30d'),
  healthSignal: varchar('health_signal', { length: 20 }).notNull().default('watch'), // 'good' | 'watch' | 'risk'
  headline: varchar('headline', { length: 300 }).notNull(),
  summary: text('summary'),
  metrics: jsonb('metrics').notNull().default('{}'),
  recommendations: jsonb('recommendations').notNull().default('[]'),
  synthesizedBy: varchar('synthesized_by', { length: 40 }).notNull().default('rules'), // model id or 'rules'
  acknowledged: boolean('acknowledged').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ── Parent Account + Sub-Rider Profiles ──────────────────────────────────────
/**
 * Sub-rider profiles owned by a parent/guardian user account.
 *
 * Architecture:
 * - Adults (18+) sign up normally and own their own team.
 * - Riders under 18 CANNOT create their own account. A parent/guardian signs up
 *   (adult account), then adds the rider here as a sub-profile.
 * - Each rider profile links to the parent's md_teams row so the full platform
 *   data (sessions, telemetry, readiness, etc.) is scoped to the team.
 * - When the rider turns 18, promoteRiderToAccount() creates a new user row,
 *   re-assigns the team, and marks this row promoted_at — atomic, no data loss.
 *
 * Security rule: EVERY query that touches rider data must join through this table
 * and verify parent_user_id = session.user.id (no RLS — enforce in queries).
 */
export const mdRiderProfiles = pgTable('md_rider_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** The authenticated parent/guardian who owns and manages this profile. */
  parentUserId: text('parent_user_id').notNull(),
  /** The md_teams row this rider's data lives under. */
  teamId: uuid('team_id').references(() => mdTeams.id, { onDelete: 'cascade' }).notNull(),
  /** Rider's legal first + last name. */
  name: varchar('name', { length: 255 }).notNull(),
  /** YYYY-MM-DD — used to compute current age and trigger promotion check. */
  dateOfBirth: date('date_of_birth').notNull(),
  /** Cached age bracket at profile creation — recomputed on each birthday. */
  ageBracket: varchar('age_bracket', { length: 20 }).notNull().default('teen_16_17'),
  /** True while rider is under 18. Set false on promotion. */
  isMinor: boolean('is_minor').notNull().default(true),
  /** Relationship of the parent to this rider (e.g. 'parent', 'legal_guardian'). */
  guardianRelationship: varchar('guardian_relationship', { length: 50 }).notNull().default('parent'),
  /**
   * Promotion state:
   * 'active'    — minor, managed by parent
   * 'eligible'  — turned 18, awaiting parent/rider to initiate promotion
   * 'promoted'  — successfully converted to standalone user account
   */
  promotionStatus: varchar('promotion_status', { length: 20 }).notNull().default('active'),
  /** user.id of the new standalone account after promotion (null until promoted). */
  promotedUserId: text('promoted_user_id'),
  /** Timestamp the rider was promoted to their own account. */
  promotedAt: timestamp('promoted_at', { withTimezone: true }),
  /** Email to send to when the rider is eligible for promotion. */
  riderEmail: varchar('rider_email', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Founding Rigs (Aug 31 2026 enrollment) ────────────────────────────────────
/** 50 founding race-team/factory-rig slots — created on successful checkout.
 *  Race Team and Factory Rig consume a slot. Privateer does not.
 */
export const mdFoundingRigs = pgTable('md_founding_rigs', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  teamId:             text('team_id').notNull().unique(),
  planId:             varchar('plan_id', { length: 50 }).notNull(),
  lockedCents:        integer('locked_cents').notNull(),
  frequency:          varchar('frequency', { length: 20 }).notNull().default('monthly'),
  slotNumber:         integer('slot_number').notNull(),
  enrolledAt:         timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  onboardingComplete: boolean('onboarding_complete').notNull().default(false),
  onboardingData:     jsonb('onboarding_data'),
})
