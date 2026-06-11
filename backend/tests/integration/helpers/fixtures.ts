import { Knex } from 'knex';
import { RestaurantStatus } from 'src/app/restaurant/enums';
import { SystemRole } from 'src/app/user/enums';

let fixtureSequence = 0;

function nextFixtureValue(prefix: string): string {
  fixtureSequence += 1;
  return `${prefix}-${fixtureSequence}`;
}

export async function seedUser(
  database: Knex,
  overrides: Record<string, unknown> = {},
): Promise<number> {
  const suffix = nextFixtureValue('user');
  const [user] = await database('users')
    .insert({
      email: `${suffix}@example.com`,
      phone: `01${String(fixtureSequence).padStart(9, '0').slice(-9)}`,
      name: 'Integration User',
      password_hash: 'hash',
      system_role: SystemRole.CUSTOMER,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    })
    .returning(['id']);

  return Number(user.id);
}

export async function seedRestaurant(
  database: Knex,
  ownerId: number,
  overrides: Record<string, unknown> = {},
): Promise<number> {
  const [restaurant] = await database('restaurants')
    .insert({
      owner_id: ownerId,
      name: nextFixtureValue('Restaurant'),
      logo_url: 'https://cdn.test/restaurant.png',
      status: RestaurantStatus.ACTIVE,
      primary_country: 'EG',
      ...overrides,
    })
    .returning(['id']);

  return Number(restaurant.id);
}

export async function seedBranch(
  database: Knex,
  restaurantId: number,
  overrides: Record<string, unknown> = {},
): Promise<number> {
  const [branch] = await database('restaurant_branches')
    .insert({
      restaurant_id: restaurantId,
      country_code: 'EG',
      address_text: 'Downtown Cairo',
      label: nextFixtureValue('Branch'),
      lat: 30.0444,
      lng: 31.2357,
      is_active: true,
      opens_at: '09:00',
      closes_at: '22:00',
      accept_orders: true,
      delivery_radius: 5,
      currency: 'EGP',
      commission: 10,
      delivery_fee: 1500,
      ...overrides,
    })
    .returning(['id']);

  return Number(branch.id);
}

export async function seedAddress(
  database: Knex,
  userId: number,
  overrides: Record<string, unknown> = {},
): Promise<number> {
  const [address] = await database('customer_addresses')
    .insert({
      user_id: userId,
      label: nextFixtureValue('Address'),
      country: 'Egypt',
      city: 'Cairo',
      street: 'Main Street',
      building: '10',
      type: 'home',
      lat: 30.0444,
      lng: 31.2357,
      is_default: false,
      ...overrides,
    })
    .returning(['id']);

  return Number(address.id);
}

export async function seedCatalog(database: Knex) {
  const ownerId = await seedUser(database, {
    system_role: SystemRole.RESTAURANT_USER,
  });
  const restaurantId = await seedRestaurant(database, ownerId);
  const branchId = await seedBranch(database, restaurantId);
  const [category] = await database('product_categories')
    .insert({ restaurant_id: restaurantId, name: 'Meals' })
    .returning(['id']);
  const [product] = await database('products')
    .insert({
      restaurant_id: restaurantId,
      category_id: category.id,
      name: 'Burger',
      description: 'Beef burger',
      image_url: 'https://cdn.test/burger.png',
    })
    .returning(['id']);

  await database('product_branch_details')
    .where({ branch_id: branchId, product_id: product.id })
    .update({ price: 2500, stock: 8, is_available: true });

  return {
    ownerId,
    restaurantId,
    branchId,
    categoryId: Number(category.id),
    productId: Number(product.id),
  };
}
