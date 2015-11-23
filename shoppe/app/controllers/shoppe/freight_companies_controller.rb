module Shoppe
  class FreightCompaniesController < Shoppe::ApplicationController
    before_filter { params[:id] && @freight_company = Shoppe::FreightCompany.find(params[:id]) }
  	load_and_authorize_resource

  	def new
  	  @freight_company = Shoppe::FreightCompany.new
  	end

  	def show
  	end

  	def edit
    end

    def index
      redirect_to :logistics
    end

    def create
      @freight_company = Shoppe::FreightCompany.new(safe_params)
      if @freight_company.save
        redirect_to @freight_company, :flash => {:notice =>  t('shoppe.logistics.freight_companies.create_notice') }
      else
        render :action => "new"
      end
    end

    def update
      if @freight_company.update(safe_params)
        redirect_to @freight_company, :flash => {:notice => t('shoppe.logistics.freight_companies.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @freight_company.destroy
      redirect_to :logistics, :flash => {:notice => t('shoppe.logistics.freight_companies.destroy_notice')}
    end

    private

    def safe_params
      params[:freight_company][:zone_ids] ||= []
      params[:freight_company].permit(:name, :dc, :website, :notes, :zone_ids => [])
    end
  end
end
