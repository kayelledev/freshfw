module Shoppe
  class Supplier < ActiveRecord::Base
  	has_many  :suppliers_zones, dependent: :destroy, :class_name => 'Shoppe::SuppliersZone'
    has_many  :zones, through: :suppliers_zones, :class_name => 'Shoppe::Zone'
    validates :name, :presence => true
  end
end
