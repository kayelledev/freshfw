module Shoppe
  class Supplier < ActiveRecord::Base
  	has_many  :suppliers_zones, dependent: :destroy, :class_name => 'Shoppe::SuppliersZone'
    has_many  :zones, through: :suppliers_zones, :class_name => 'Shoppe::Zone'
    has_many  :products, :class_name => 'Shoppe::Product'
    validates :name, :presence => true
    accepts_nested_attributes_for :zones

    def self.search(zones)
      self.joins(:zones).where("shoppe_zones.id": zones)
    end
  end
end
