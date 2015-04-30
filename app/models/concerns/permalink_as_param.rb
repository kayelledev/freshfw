module PermalinkAsParam
  extend ActiveSupport::Concern

  included do
    def to_param
      permalink
    end
  end

end