module Shoppe
  class FreightCompaniesZone < ActiveRecord::Base
  	belongs_to :freight_company
    belongs_to :zone
  end
end
