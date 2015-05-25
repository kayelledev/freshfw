class ProductCategoriesController < ApplicationController
  include ProductsHelper
  include ActionView::Helpers::UrlHelper

  before_action :find_product, except: [:index]

  def index
    @categories = Shoppe::ProductCategory.ordered(:parent_id)
  end

  def show
  end

end
