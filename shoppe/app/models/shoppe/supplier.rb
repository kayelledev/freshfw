module Shoppe
  class Supplier < ActiveRecord::Base
  	has_many  :suppliers_zones, dependent: :destroy
    has_many  :zones, through: :suppliers_zones
    validates :name, :presence => true
  end
end
