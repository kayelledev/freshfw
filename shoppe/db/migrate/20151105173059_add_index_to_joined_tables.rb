class AddIndexToJoinedTables < ActiveRecord::Migration
  def self.up
    add_index :shoppe_suppliers_zones, [:supplier_id, :zone_id], :unique => true
    add_index :shoppe_cities_zones, [:city_id, :zone_id], :unique => true
    add_index :shoppe_last_mile_companies_zones, [:last_mile_company_id, :zone_id], :unique => true, :name => 'last_mile_company_zone_index'
    add_index :shoppe_freight_companies_zones, [:freight_company_id, :zone_id], :unique => true, :name => 'freight_company_zone_index'
  end

  def self.down
    remove_index :shoppe_suppliers_zones, [:supplier_id, :zone_id]
    remove_index :shoppe_cities_zones, [:city_id, :zone_id]
    remove_index :shoppe_last_mile_companies_zones, :name => 'last_mile_company_zone_index' 
    remove_index :shoppe_freight_companies_zones, :name => 'freight_company_zone_index'
  end
end
