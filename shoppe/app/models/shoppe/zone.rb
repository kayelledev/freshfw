module Shoppe
  class Zone < ActiveRecord::Base
  	has_many  :suppliers_zones, dependent: :destroy, :class_name => 'Shoppe::SuppliersZone'
    has_many  :suppliers, through: :suppliers_zones, :class_name => 'Shoppe::Supplier'
    has_many  :freight_companies_zones, dependent: :destroy, :class_name => 'Shoppe::FreightCompaniesZone'
    has_many  :freight_companies, through: :freight_companies_zones, :class_name => 'Shoppe::FreightCompany'
    has_many  :last_mile_companies_zones, dependent: :destroy, :class_name => 'Shoppe::LastMileCompaniesZone'
    has_many  :last_mile_companies, through: :last_mile_companies_zones, :class_name => 'Shoppe::LastMileCompany'
    has_many  :cities_zones, dependent: :destroy, :class_name => 'Shoppe::CitiesZone'
    has_many  :cities, through: :cities_zones, :class_name => 'Shoppe::City'
    accepts_nested_attributes_for :cities #, :allow_destroy => true, :reject_if => Proc.new { |a| a['city_id'].blank? }
    validates :name, :presence => true
    
    def self.customer_search(query)
      query.present? ? Shoppe::Zone.joins(:cities).where('((shoppe_cities.name LIKE ?) OR (shoppe_zones.name LIKE ?))', "%#{query}%", "%#{query}%").uniq : nil
    end

    def self.supplier_search(query)
      query.present? ? Shoppe::Zone.joins(:cities, :suppliers).where('((shoppe_cities.name LIKE ?) OR (shoppe_suppliers.name LIKE ?) OR (shoppe_suppliers.warehouse LIKE ?) OR (shoppe_zones.name LIKE ?))', "%#{query}%", "%#{query}%", "%#{query}%", "%#{query}%").uniq : nil
    end
  end
end
