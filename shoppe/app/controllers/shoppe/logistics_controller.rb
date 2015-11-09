module Shoppe
  class LogisticsController < Shoppe::ApplicationController
	def index
	# TODO search result 
	  @freight_routes = Shoppe::FreightRoute.all
	  @zones = Shoppe::Zone.all
	  @suppliers = Shoppe::Supplier.all
	  @last_mile_companies = Shoppe::LastMileCompany.all
	  @freight_companies =  Shoppe::FreightCompany.all
    end

    def search
      index
      render :action => "index"
    end
  end
end
