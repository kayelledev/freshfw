module Shoppe
  class LogisticsController < Shoppe::ApplicationController
	before_filter { @supplier, @customer = params[:supplier], params[:customer] }
	
	def index
   	  @zones = Shoppe::Zone.all
	  @suppliers = Shoppe::Supplier.all
	  @last_mile_companies = Shoppe::LastMileCompany.all
	  @freight_companies =  Shoppe::FreightCompany.all
	  @freight_routes = Shoppe::FreightRoute.all
    end

    def search
      @customer_zones, @supplier_zones = Shoppe::Zone.customer_search(params[:customer]),Shoppe::Zone.supplier_search(params[:supplier])
  	  @zones = (@customer_zones + @supplier_zones).uniq
  	  @suppliers = Shoppe::Supplier.joins(:zones).where("shoppe_zones.id": @supplier_zones)
      @last_mile_companies = Shoppe::LastMileCompany.joins(:zones).where("shoppe_zones.id": @zones)
      @freight_companies =  Shoppe::FreightCompany.joins(:zones).where("shoppe_zones.id": @zones)
  	  suppliers = Shoppe::SuppliersZone.where(zone_id: @supplier_zones)
  	  @freight_routes = Shoppe::FreightRoute.where(suppliers_zone_id: suppliers, zone_id: @customer_zones) 
      render "index"
    end
  end
end
