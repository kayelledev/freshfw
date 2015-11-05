module Shoppe
  class LastMileCompaniesZone < ActiveRecord::Base
  	belongs_to :last_mile_company
    belongs_to :zone
  end
end
