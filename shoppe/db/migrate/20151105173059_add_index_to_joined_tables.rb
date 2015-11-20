class AddIndexToJoinedTables < ActiveRecord::Migration
  def self.up
    add_index :shoppe_suppliers_zones, [:supplier_id, :zone_id], :unique => true
    add_index :shoppe_cities_zones, [:city_id, :zone_id], :unique => true
    add_index :shoppe_last_mile_companies_zones, [:last_mile_company_id, :zone_id], :unique => true, :name => 'last_mile_company_zone_index'
    add_index :shoppe_freight_companies_zones, [:freight_company_id, :zone_id], :unique => true, :name => 'freight_company_zone_index'

    # Test data generation
    zoneA = Shoppe::Zone.where(name: "A").first_or_create
    zoneB = Shoppe::Zone.where(name: "B").first_or_create
    # cities generation
    country = Shoppe::Country.where(name: "Canada").first_or_create
    city1 = Shoppe::City.where(name: "Monreal", country_id: country.id, province: "QC").first_or_create
    city1.zones << zoneA
    city2 = Shoppe::City.where(name: "Toronto", country_id: country.id, province: "ON").first_or_create
    city2.zones << zoneA
    # supplier generation
    supplier1 = Shoppe::Supplier.where(name: "Zuo Modern", warehouse: "Monreal", website: "zuomod").first_or_create
    supplier1.zones << zoneB
    supplier1_zone = Shoppe::SuppliersZone.where(supplier_id: supplier1.id, zone_id: zoneB.id).first
    # freight companies
    fcompany1 = Shoppe::FreightCompany.where(name: "Dejong", dc: "High Point", website: "dejong.ca").first_or_create
    fcompany1.zones << zoneA
    # last mile companies
    lmcompany1 = Shoppe::LastMileCompany.where(name: "AMJ", city: "Toronto", address: "Mississauga").first_or_create
    lmcompany1.zones << zoneA
    lmcompany2 = Shoppe::LastMileCompany.where(name: "VA Transport", city: "Toronto", address: "Bolton").first_or_create
    lmcompany2.zones << zoneA
    # freight routes
    route1 = Shoppe::FreightRoute.where(travel_days: 4, freight_company_id: fcompany1.id, zone_id: zoneA.id, suppliers_zone_id: supplier1_zone).first_or_create
  end

  def self.down
    remove_index :shoppe_suppliers_zones, [:supplier_id, :zone_id]
    remove_index :shoppe_cities_zones, [:city_id, :zone_id]
    remove_index :shoppe_last_mile_companies_zones, :name => 'last_mile_company_zone_index' 
    remove_index :shoppe_freight_companies_zones, :name => 'freight_company_zone_index'
  end
end
