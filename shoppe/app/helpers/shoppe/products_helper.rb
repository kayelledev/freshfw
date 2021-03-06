module Shoppe

  module ProductsHelper

    def array_images
      ['default_image'] + (2..6).map{|index| "image#{index}"}
    end

    def image_link(product, img)
      if (product.send "url_#{img}").present?
        product.send "url_#{img}"
      elsif (product.send img).present?
        image = product.send img
        image.thumb.url
      else
        nil
      end
    end

    def product_dimensions(product)
      "#{product.width}\" x #{product.depth}\" x #{product.height}\""
    end
     
    
    def full_measure(value)
      ft = value.to_i / 12
      inch = value.to_i % 12
      {ft: ft, inch: inch}
    end
  end
end
