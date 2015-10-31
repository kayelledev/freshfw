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

  end

end
