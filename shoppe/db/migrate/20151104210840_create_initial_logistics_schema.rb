class CreateInitialLogisticsSchema < ActiveRecord::Migration
  def up
    create_table "shoppe_zones" do |t|
      t.string  "name"
    end

    create_table "shoppe_suppliers" do |t|
      t.string  "warehouse"
      t.string  "name"
      t.string  "website"
      t.string  "prime"
      t.text    "notes"
    end

    create_table "shoppe_cities" do |t|
      t.references :country, index: true
      t.string  "name"
      t.string  "province"
    end

    create_table "shoppe_last_mile_companies" do |t|
      t.string  "name"
      t.string  "city"
      t.string  "address"
      t.text    "notes"
    end
    
    create_table "shoppe_freight_companies" do |t|
      t.string  "name"
      t.string  "dc"
      t.string  "website"
      t.text    "notes"
    end
    
    create_table "shoppe_suppliers_zones" do |t|
      t.references :supplier, index: true
      t.references :zone, index: true
    end
    
    create_table "shoppe_cities_zones" do |t|
      t.references :city, index: true
      t.references :zone, index: true
    end

    create_table "shoppe_last_mile_companies_zones" do |t|
      t.references :last_mile_company, index: true
      t.references :zone, index: true
    end
    
    create_table "shoppe_freight_companies_zones" do |t|
      t.references :freight_company, index: true
      t.references :zone, index: true
    end
    
    create_table "shoppe_freight_routes" do |t|
      t.integer    "trevel_days"
      t.references :freight_company, index: true
      t.references :zone, index: true
      t.references :suppliers_zone, index: true
    end
  end
  
  def down
    [:zones, :suppliers, :freight_companies, :last_mile_companies, :cities, :freight_routes, :suppliers_zones, :freight_companies_zones, :last_mile_companies_zones, :cities_zones].each do |table|
      drop_table "shoppe_#{table}"
    end
  end
end
