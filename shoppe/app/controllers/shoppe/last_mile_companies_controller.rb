module Shoppe
  class LastMileCompaniesController < Shoppe::ApplicationController
    before_filter { params[:id] && @last_mile_company = Shoppe:: LastMileCompany.find(params[:id]) }
  	load_and_authorize_resource

  	def new
  	  @last_mile_company = Shoppe:: LastMileCompany.new
  	end

  	def show
  	end

  	def edit
    end

    def index
      redirect_to :logistics
    end

    def create
      @last_mile_company = Shoppe:: LastMileCompany.new(safe_params)
      if @last_mile_company.save
        redirect_to @last_mile_company, :flash => {:notice =>  t('shoppe.logistics.last_mile_companies.create_notice') }
      else
        render :action => "new"
      end
    end

    def update
      if @last_mile_company.update(safe_params)
        redirect_to @last_mile_company, :flash => {:notice => t('shoppe.logistics.last_mile_companies.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @last_mile_company.destroy
      redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.last_mile_companies.destroy_notice')}
    end

    private

    def safe_params
      params[:last_mile_company][:zone_ids] ||= []
      params[:last_mile_company].permit(:name, :city, :address, :notes, :zone_ids => [])
    end
  end
end
