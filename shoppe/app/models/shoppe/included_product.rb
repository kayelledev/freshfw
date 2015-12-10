module Shoppe
  class IncludedProduct < ActiveRecord::Base
    self.table_name = 'shoppe_included_products'

    belongs_to :parent_product, foreign_key: "parent_product_id"
    belongs_to :included_product

  end
end
