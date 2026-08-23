import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create default shopping list ────────────────────────────
  const list = await prisma.shoppingList.upsert({
    where: { id: "default-list" },
    update: {},
    create: {
      id: "default-list",
      name: "My Shopping List",
    },
  });
  console.log(`✅ Shopping list created: ${list.id}`);

  // ─── Seed Item History (frequently bought items) ──────────────
  const historyItems = [
    { name: "Whole Milk", category: "Dairy", count: 24 },
    { name: "Eggs", category: "Dairy", count: 22 },
    { name: "Sourdough Bread", category: "Bakery", count: 18 },
    { name: "Bananas", category: "Produce", count: 17 },
    { name: "Chicken Breast", category: "Meat", count: 16 },
    { name: "Cheddar Cheese", category: "Dairy", count: 15 },
    { name: "Spinach", category: "Produce", count: 14 },
    { name: "Pasta", category: "Pantry", count: 13 },
    { name: "Olive Oil", category: "Pantry", count: 12 },
    { name: "Greek Yogurt", category: "Dairy", count: 12 },
    { name: "Orange Juice", category: "Beverages", count: 11 },
    { name: "Tomatoes", category: "Produce", count: 11 },
    { name: "Broccoli", category: "Produce", count: 10 },
    { name: "Salmon Fillet", category: "Meat", count: 9 },
    { name: "Butter", category: "Dairy", count: 9 },
    { name: "Coffee", category: "Beverages", count: 9 },
    { name: "Avocados", category: "Produce", count: 8 },
    { name: "Garlic", category: "Produce", count: 8 },
    { name: "Canned Tomatoes", category: "Pantry", count: 8 },
    { name: "Rice", category: "Pantry", count: 7 },
    { name: "Dish Soap", category: "Household", count: 7 },
    { name: "Paper Towels", category: "Household", count: 6 },
    { name: "Almonds", category: "Pantry", count: 6 },
    { name: "Sparkling Water", category: "Beverages", count: 6 },
    { name: "Sweet Potatoes", category: "Produce", count: 5 },
    { name: "Ground Beef", category: "Meat", count: 5 },
    { name: "Blueberries", category: "Produce", count: 5 },
    { name: "Hummus", category: "Pantry", count: 5 },
    { name: "Almond Milk", category: "Dairy", count: 4 },
    { name: "Tortillas", category: "Bakery", count: 4 },
  ];

  for (const item of historyItems) {
    await prisma.itemHistory.upsert({
      where: { name: item.name },
      update: { count: item.count },
      create: { ...item, lastUsed: new Date() },
    });
  }
  console.log(`✅ Seeded ${historyItems.length} history items`);

  // ─── Seed Catalogue (seasonal + substitutions) ─────────────────
  const catalogueItems = [
    // Seasonal — Summer
    { name: "Watermelon", category: "Produce", season: "summer", estimatedPrice: 6.99, tags: ["fresh", "fruit", "hydrating"] },
    { name: "Peaches", category: "Produce", season: "summer", estimatedPrice: 3.49, tags: ["fresh", "fruit", "stone-fruit"] },
    { name: "Corn on the Cob", category: "Produce", season: "summer", estimatedPrice: 0.89, tags: ["fresh", "vegetable", "grilling"] },
    { name: "Zucchini", category: "Produce", season: "summer", estimatedPrice: 1.99, tags: ["fresh", "vegetable"] },
    { name: "Basil", category: "Produce", season: "summer", estimatedPrice: 2.49, tags: ["herb", "fresh"] },
    // Seasonal — Fall
    { name: "Pumpkin", category: "Produce", season: "fall", estimatedPrice: 4.99, tags: ["squash", "seasonal"] },
    { name: "Apples", category: "Produce", season: "fall", estimatedPrice: 2.99, tags: ["fruit", "fresh"] },
    { name: "Butternut Squash", category: "Produce", season: "fall", estimatedPrice: 3.49, tags: ["squash", "roasting"] },
    // Seasonal — Winter
    { name: "Clementines", category: "Produce", season: "winter", estimatedPrice: 5.99, tags: ["citrus", "fruit"] },
    { name: "Brussels Sprouts", category: "Produce", season: "winter", estimatedPrice: 2.99, tags: ["vegetable", "roasting"] },
    // Seasonal — Spring
    { name: "Asparagus", category: "Produce", season: "spring", estimatedPrice: 3.99, tags: ["vegetable", "fresh"] },
    { name: "Strawberries", category: "Produce", season: "spring", estimatedPrice: 4.49, tags: ["fruit", "fresh"] },
    // ─── Substitutes ─────────────────────────────────────────────
    { name: "Oat Milk", category: "Dairy", estimatedPrice: 4.99, isSubstituteFor: "Whole Milk", tags: ["dairy-free", "vegan", "plant-based"] },
    { name: "Almond Milk", category: "Dairy", estimatedPrice: 3.99, isSubstituteFor: "Whole Milk", tags: ["dairy-free", "vegan", "plant-based"] },
    { name: "Coconut Milk", category: "Dairy", estimatedPrice: 3.49, isSubstituteFor: "Whole Milk", tags: ["dairy-free", "vegan"] },
    { name: "Stevia", category: "Pantry", estimatedPrice: 5.99, isSubstituteFor: "White Sugar", tags: ["sugar-free", "keto", "natural"] },
    { name: "Honey", category: "Pantry", estimatedPrice: 7.99, isSubstituteFor: "White Sugar", tags: ["natural", "sweetener"] },
    { name: "Coconut Sugar", category: "Pantry", estimatedPrice: 6.49, isSubstituteFor: "White Sugar", tags: ["natural", "low-gi"] },
    { name: "Gluten-Free Bread", category: "Bakery", estimatedPrice: 6.99, isSubstituteFor: "Sourdough Bread", tags: ["gluten-free", "celiac"] },
    { name: "Cauliflower Rice", category: "Produce", estimatedPrice: 3.99, isSubstituteFor: "Rice", tags: ["low-carb", "keto", "paleo"] },
    { name: "Zoodles (Zucchini Noodles)", category: "Produce", estimatedPrice: 2.99, isSubstituteFor: "Pasta", tags: ["low-carb", "keto", "gluten-free"] },
    { name: "Turkey Bacon", category: "Meat", estimatedPrice: 5.49, isSubstituteFor: "Bacon", tags: ["lean", "low-fat"] },
    { name: "Vegan Cheese", category: "Dairy", estimatedPrice: 6.99, isSubstituteFor: "Cheddar Cheese", tags: ["vegan", "dairy-free"] },
    { name: "Avocado Oil", category: "Pantry", estimatedPrice: 8.99, isSubstituteFor: "Olive Oil", tags: ["high-smoke-point", "healthy"] },
    // ─── General Catalogue ────────────────────────────────────────
    { name: "Organic Apples", category: "Produce", estimatedPrice: 4.99, tags: ["organic", "fruit", "fresh"] },
    { name: "Almond Butter", category: "Pantry", estimatedPrice: 9.99, tags: ["nut-butter", "protein", "snack"] },
    { name: "Kombucha", category: "Beverages", estimatedPrice: 3.99, tags: ["probiotic", "fermented", "healthy"] },
    { name: "Laundry Detergent", category: "Household", estimatedPrice: 12.99, tags: ["cleaning", "laundry"] },
    { name: "Protein Powder", category: "Pantry", estimatedPrice: 29.99, tags: ["protein", "fitness", "supplement"] },
    { name: "Dark Chocolate", category: "Pantry", estimatedPrice: 3.99, tags: ["snack", "dessert", "antioxidant"] },
    { name: "Chia Seeds", category: "Pantry", estimatedPrice: 7.99, tags: ["superfood", "omega-3", "fiber"] },
    { name: "Quinoa", category: "Pantry", estimatedPrice: 8.99, tags: ["grain", "protein", "gluten-free"] },
    { name: "Tofu", category: "Meat", estimatedPrice: 2.99, tags: ["vegan", "protein", "plant-based"] },
    { name: "Greek Yogurt", category: "Dairy", estimatedPrice: 1.99, tags: ["probiotic", "protein", "breakfast"] },
  ];

  // Clear existing catalogue
  await prisma.catalogue.deleteMany();

  for (const item of catalogueItems) {
    await prisma.catalogue.create({
      data: {
        name: item.name,
        category: item.category,
        season: item.season ?? null,
        estimatedPrice: item.estimatedPrice ?? null,
        isSubstituteFor: item.isSubstituteFor ?? null,
        tags: JSON.stringify(item.tags),
        inStock: true,
      },
    });
  }
  console.log(`✅ Seeded ${catalogueItems.length} catalogue items`);

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
