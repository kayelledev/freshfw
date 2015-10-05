class RoomController < ApplicationController
  def index

    @items = Shoppe::Product.all

    @categories = Shoppe::ProductCategory.all
  end
end
