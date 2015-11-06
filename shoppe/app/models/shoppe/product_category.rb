module Shoppe
  class ProductCategory < ActiveRecord::Base

    belongs_to :parent, class_name: "ProductCategory"
    has_many :children, class_name: "ProductCategory", foreign_key: "parent_id"

    validate :parent_himself
    validate :parent_children

    self.table_name = 'shoppe_product_categories'

    # Categories have an image attachment
    mount_uploader :default_image, ImageUploader
    #attachment :image

    # All products within this category
    has_many :products, :dependent => :restrict_with_exception, :class_name => 'Shoppe::Product'

    # Validations
    validates :name, :presence => true, :uniqueness => true
    validates :permalink, :presence => true, :uniqueness => true, :permalink => true

    # All categories ordered by their name ascending
    scope :ordered, -> { order(:name) }

    # Set the permalink on callback
    before_validation { self.permalink = self.name.parameterize if self.permalink.blank? && self.name.is_a?(String) }

    def parent_name
      # it may not have a parent
      parent.try(:name)
    end

    def has_parent?
      parent.present?
    end

    def has_children?
      children.exists?
    end

    def parent_himself
      if self.id && self.id == self.parent_id
        errors.add(:parent, "Category can not be parent to itself")
      end
    end

    def parent_children
        if self.id && self.parent_id
          parent_id = self.parent_id
          parents = [parent_id]
          while parent_id do
            p parent_id
            parent_id = Shoppe::ProductCategory.find(parent_id).parent_id
            parents << parent_id
            p parent_id
            p parents.uniq
            if parents.include?(self.id)
              errors.add("#{self.name}", "can not be children for category #{parent.name}")
              break
            end
          end
        end
    end

    def all_parents
      p = self.parent
      data = [p]
      while p do
        p = p.parent
        data.unshift(p)
      end
      data
    end

    def self.category_with_subcategories
      temp = Shoppe::ProductCategory.all.order(:name)
      data = temp.select{|t| t.parent_id.nil?}

      #КОСТЫЛЬ
      room_cat = data.find{|t| t.name.downcase.eql?('rooms')}
      if room_cat
        data.delete(room_cat)
        data.unshift(room_cat)
      end

      temp -= data
      while temp.present?
        temp.each do |t|
          t.parent
          if data.include?(t.parent)
            data.insert( data.index(t.parent) , t)
          end
        end
        temp -= data
      end
      data
    end

    def self.categories_to_tree
      categories = Shoppe::ProductCategory.all.order(:name).to_a
      @nodes = categories.map do |category|
        x = {}
        x[:text] = category.name
        x[:id] = category.id
        x[:parent_id] = category.parent_id
        x[:children_count] = category.children.count
        x[:href] = ['product_categories', category.id, 'edit'].join('/')
        x[:nodes] = []
        x
      end
      while @nodes.select{|node| !node[:parent_id].nil?}.count > 0
        @nodes.each do |node|
          if (node[:parent_id]) && (node[:children_count] == node[:nodes].count)
            parent = @nodes.find{|n| n[:id] == node[:parent_id]}
            node[:nodes] = nil if node[:children_count].zero?
            parent[:nodes] << node
            @nodes.delete(node)
          end
        end
      end
      @nodes.each do |node|
        node[:nodes] = nil if node[:children_count].zero?
      end
      @nodes
    end

  end
end
