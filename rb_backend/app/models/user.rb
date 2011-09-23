require 'digest'
class User < ActiveRecord::Base
  #before_save :encrypt_new_password
  
  attr_accessor :password
  
  validates :password, :confirmation => true
  
  has_many :comments
  has_many :projects
  
  validates :name, :presence => true,
                   :uniqueness => true
  
  validates :hashed_password, :presence => true
  
  validates :email, :presence => true, 
                    :uniqueness => true
                    
  validates :skin_preference, :presence => true
  
  validates :date_joined, :presence => true
  
  def self.authenticate(email, password)
    user = find_by_email(email)
    return user if user && user.authenticated?(password)
  end
  
  protected
    
    def authenticated?(password)
      return self.hashed_password == encrypt(password)
    end
    
    def encrpyt_new_password
      return if password.blank?
      self.hashed_password = encrypt(password)
    end
    
    def encrypt(string)
      return Digest::SHA1.hexdigest(string)
    end
  
end
