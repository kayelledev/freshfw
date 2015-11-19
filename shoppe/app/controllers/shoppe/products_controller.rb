module Shoppe
  class ProductsController < Shoppe::ApplicationController
    load_and_authorize_resource
    before_filter { @active_nav = :products }
    before_filter { params[:id] && @product = Shoppe::Product.root.find(params[:id]) }

    def index
      #@products = Shoppe::Product.root.includes(:stock_level_adjustments, :product_category, :variants).order(:name).group_by(&:product_category).sort_by { |cat,pro| cat.id }
      @products = Shoppe::Product.root.includes(:stock_level_adjustments, :product_category, :variants).order(:name, :sku)
      @categories = Shoppe::ProductCategory.category_with_subcategories
    end

    def new
      @product = Shoppe::Product.new
    end

    def create
      @product = Shoppe::Product.new(safe_params)
      if @product.save
        redirect_to :products, :flash => {:notice =>  t('shoppe.products.create_notice') }
      else
        render :action => "new"
      end
    end

    def edit
    end

    def update
      if @product.update(safe_params)
        @product.update_included_products params[:included] if params[:included]
        redirect_to [:edit, @product], :flash => {:notice => t('shoppe.products.update_notice') }
      else
        render :action => "edit"
      end
    end

    def destroy
      @product.destroy
      redirect_to :products, :flash => {:notice =>  t('shoppe.products.destroy_notice')}
    end

    def import
      @import_logs =  Shoppe::ImportLog.order(start_time: :desc).includes(:user).limit(50)
      if request.post?
        if params[:import][:import_file].nil?
          redirect_to import_products_path, :flash => {:alert => I18n.t('shoppe.imports.errors.no_file')}
        else
          status = Shoppe::Product.import(params[:import][:import_file], params[:import][:email], current_user)
          redirect_to products_path, :flash => {:notice => status}
        end
      end
    end

    private

    def safe_params
      params[:product].permit(:product_category_id, :product_subcategory_id, :name, :sku, :permalink, :description,
                              :short_description, :weight, :price, :cost_price, :tax_rate_id,
                              :stock_control, :default_image, :image2, :image3, :image4, :image5, :image6,
                              :default_image_file_sheet_file, :active, :featured, :in_the_box, :image,
                              :width, :height, :depth,:other_details, :is_preset,
                              :url_default_image, :url_image2, :url_image3, :url_image4, :url_image5, :url_image6,
                              :seat_width, :seat_depth, :seat_height, :arm_height,
                              :product_attributes_array => [:key, :value, :searchable, :public], :included=>[]
                              )
    end

  end
end
