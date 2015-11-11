module Shoppe
  class CitiesController < Shoppe::ApplicationController
  	before_filter { params[:zone_id] && @zone = Shoppe::Zone.find(params[:zone_id]) }
    before_filter { params[:id] && @city = Shoppe::City.find(params[:id]) }

  	def new
      @city = @zone.cities.new
  	end

  	def show
  	end

    def edit
    end

    def create
      @city = @zone.cities.create(safe_params)
      begin
        if @city.save 
          redirect_to @zone, :flash => {:notice =>  t('shoppe.logistics.cities.create_notice') }
        else
          render :action => "new"
        end
      rescue ActiveRecord::RecordInvalid => e
        render :action => "new", :flash => {:notice =>  e.record.errors  }
      end
    end

    def update
      if @city.update(safe_params)
        redirect_to @zone, :flash => {:notice => t('shoppe.logistics.cities.update_notice') }
      else
        render :action => "edit"
      end
    end



    private
    def safe_params
      params[:city].permit(:name, :province, :country_id)
    end

  end
end
