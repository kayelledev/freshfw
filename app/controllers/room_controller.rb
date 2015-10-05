class RoomController < ApplicationController
  def index

    @items = Shoppe::Product.all
  end
end
