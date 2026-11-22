// Original fictional histories for the three vCraft demo workshops.
// These are narrative samples, not records about real people or businesses.
const FICTION_NOTE = 'Truyện hư cấu minh họa cho vCraft. Nhân vật, niên đại, các đời truyền nghề và sự kiện trong cuốn sách này đều được sáng tác.';

const workshopBooks = [
  {
    name: 'Xưởng Nét Mộc', ownerEmail: 'artisan@vcraft.local', title: 'Những vân gỗ còn nhớ',
    introduction: 'Có những gia đình giữ kỷ niệm trong một chiếc rương. Gia đình Nét Mộc giữ chúng trong tiếng dao chạm gỗ, trong chiếc bàn thấp cạnh cửa và mùi giấy vừa mở. Cuốn sách này lần theo bốn thế hệ, qua những lần rời đi, trở lại và học cách bắt đầu thêm một lần nữa.',
    chapters: [
      { period: '1954', title: 'Chiếc bàn dưới mái hiên', paragraphs: [
        'Cụ Lâm bắt đầu bằng một chiếc bàn kê lệch chân. Mỗi khi người khách tì tay lên mép bàn, nó lại khẽ nghiêng, làm bát nước bên cạnh rung thành một vòng nhỏ. Cụ chèn vào chân bàn một mảnh gỗ vụn rồi ngồi xuống, thong thả như thể đã chuẩn bị cho ngày ấy từ rất lâu. Ngoài chiếc bàn, cụ chỉ có ba con dao, một tấm ván cũ và thói quen nhìn thật kỹ những thứ bình thường.',
        'Bức đầu tiên cụ thử khắc là con gà. Cái mào hơi to, hai chân chưa cân và chiếc đuôi bị cụ sửa đi sửa lại đến mỏng cả một góc ván. Bà Hiên nhìn bản in đầu, cười bảo con gà ấy giống chủ nhà: dáng gầy nhưng lúc nào cũng có vẻ muốn gọi người khác thức dậy. Cụ giữ nguyên chiếc đuôi vụng về, không sửa nữa.',
        'Tối hôm ấy, dưới ngọn đèn nhỏ, cụ viết vào mặt sau của ván hai chữ “Nét Mộc”. Cái tên chưa phải biển hiệu, chỉ là lời tự nhắc rằng bàn tay mình còn thô thì cứ bắt đầu từ sự thật thà. Nhiều năm sau, con cháu vẫn giữ chiếc bàn lệch chân, cùng mảnh gỗ chèn nhỏ xíu không ai nỡ thay.'
      ] },
      { period: '1968', title: 'Người giữ những tờ giấy cuối mùa', paragraphs: [
        'Trong nhà, bà Hiên là người nhớ rõ nhất mỗi chồng giấy đã đi qua những mùa nào. Bà buộc chúng bằng dây vải mềm, đặt những tờ cũ bên trên để khi mở ra không ai quên dùng trước. Những hôm trời nồm, bà dậy sớm chuyển giấy sang gian trong; lúc có nắng, bà lại kê ghế bên cửa, ngồi kiểm từng mép một.',
        'Một mùa mưa dài, cụ Lâm muốn bỏ cả xấp bản in vì màu không đều. Bà lựa ra những tờ còn dùng được, phơi lại rồi cắt thành những mảnh nhỏ cho trẻ trong xóm tập in. Căn hiên vốn yên lặng bỗng đầy tiếng cười. Có đứa in ngược, có đứa làm lem cả ngón tay, nhưng chẳng đứa nào muốn về trước khi đem được một con gà của riêng mình.',
        'Từ ấy, xưởng có một chiếc hộp mang tên “giấy còn một lần nữa”. Không phải tờ giấy nào cũng thành tranh đem bán; có tờ trở thành chỗ bắt đầu của một đứa trẻ. Người trong nhà thường nói cụ Lâm giữ nét, còn bà Hiên giữ cho nét ấy có nơi để trở về.'
      ] },
      { period: '1982', title: 'Bài học của người con thứ', paragraphs: [
        'Ông Phúc, người con thứ của cụ Lâm, nhận việc mài dao vào năm hai mươi tuổi. Ông nóng ruột muốn khắc một tấm ván thật lớn, nhưng cha chỉ giao chiếc dao nhỏ nhất và bảo cứ mài cho đến khi không còn nghe tiếng sạn. Suốt một tuần, Phúc thấy mình làm mãi một việc chẳng ai nhìn thấy. Ông còn nghĩ cha cố tình giấu nghề.',
        'Đến ngày được khắc, Phúc đi quá nhanh ở một đường cong và làm sứt cả mép hoa. Ông ngồi nhìn chỗ trống ấy rất lâu. Cụ Lâm không trách, chỉ lấy mảnh ván hỏng làm ví dụ để chỉ cho con cách dừng tay trước khi đi hết một nét. Mảnh hoa thiếu được treo lên tường, ngay trên chỗ ngồi của Phúc.',
        'Sau này, khi có người hỏi bài học đầu tiên là gì, ông Phúc không nói đến con dao hay đường khắc. Ông kể về một tuần mài dao mà mình từng muốn bỏ qua. Trên bàn ông luôn có một khoảng trống dành cho người học việc, và ông chưa bao giờ giục ai phải làm cho nhanh để chứng tỏ mình đã biết nghề.'
      ] },
      { period: '1996', title: 'Tấm ván được tìm lại trong chiếc hòm', paragraphs: [
        'Một lần sửa mái, gia đình chuyển chiếc hòm gỗ xuống sân và tìm thấy dưới đáy một tấm ván bọc trong áo cũ. Đó là bản con gà đầu tay của cụ Lâm. Phần mép đã sẫm màu, chỗ chiếc đuôi sửa vụng vẫn còn nguyên. Ông Phúc muốn in thử ngay, nhưng bà Hiên bắt mọi người ăn cơm xong mới được mở, như thể đón một người thân đi xa vừa trở về.',
        'Bản in hôm ấy không hoàn hảo. Có một khoảng nét đứt, vài chỗ nhạt hơn những bản mới. Cả nhà đặt tờ tranh giữa bàn, nghe bà kể lại buổi tối cha đặt tên xưởng. Những người cháu lần đầu biết rằng thứ mình vẫn gọi là “cái ván cũ” từng là cả một khởi đầu chật vật.',
        'Ông Phúc làm cho tấm ván một chiếc hộp vừa vặn, ghi lại câu chuyện vào sổ. Xưởng bắt đầu đánh số những bản khắc và chép cả những lần sửa, những chỗ sứt, những điều đã học được. Chiếc hòm không còn là nơi cất đồ quên lãng; nó trở thành một giá sách bằng gỗ, mỗi tấm ván là một trang ký ức.'
      ] },
      { period: '2007', title: 'Lá thư của người cháu rời làng', paragraphs: [
        'Lan, cháu gái ông Phúc, lên thành phố học thiết kế và từng nghĩ mình sẽ không quay lại làm tranh. Những năm đầu, cô chỉ về vào dịp Tết, mang theo những cuốn sổ đầy màu sắc và câu chuyện về biển hiệu, cửa hàng, những kiểu chữ mới. Bố cô nghe chăm chú nhưng ít nói, vẫn ngồi sửa chiếc cán dao quen thuộc bên hiên.',
        'Một ngày, Lan nhận được phong thư có một bản in nhỏ, bên dưới là dòng chữ của bố: “Chỗ này con xem có cách nào để người trẻ hiểu dễ hơn không?”. Không phải lời gọi về, cũng không phải trách móc. Chỉ là một câu hỏi thật lòng. Lan đặt bản tranh lên bàn học và bắt đầu viết những chú thích đầu tiên về từng lớp màu, từng đường nét.',
        'Mùa hè sau, cô trở lại với chiếc máy ảnh, chụp bàn tay bố trước khi chụp những bức tranh. Hai cha con tranh luận suốt nhiều buổi về cách trưng bày. Cuối cùng, Lan nhận ra trở về không nhất thiết là làm giống hệt người đi trước. Có khi chỉ là tìm một cánh cửa khác để câu chuyện cũ bước ra ngoài.'
      ] },
      { period: '2016', title: 'Ngày xưởng mở cửa cho một lớp học nhỏ', paragraphs: [
        'Lớp học đầu tiên chỉ có bảy người. Lan kê chiếc bàn lệch chân vào giữa sân, trải giấy lên và đặt những bản mẫu cạnh nhau. Ông Phúc đã chuẩn bị một bài giới thiệu rất dài, nhưng vừa thấy đứa nhỏ nhất tò mò nhìn những ngón tay dính màu của mình, ông lại quên gần hết. Ông đưa cho em một tờ giấy và nói: “Mình thử từ đây nhé”.',
        'Buổi học chậm hơn dự tính. Có người sợ làm hỏng, có người hỏi vì sao hai bản in từ cùng một ván vẫn có chút khác nhau. Ông Phúc lấy chính hai tờ ấy đặt dưới nắng, chỉ những khoảng đậm nhạt rất nhỏ. Lan ghi lại câu trả lời, nhưng điều cô nhớ nhất là vẻ nhẹ nhõm của người khách khi hiểu một dấu tay cũng có chỗ của nó trong bức tranh.',
        'Chiều muộn, mọi người tự buộc tranh mang về. Sân xưởng còn vài vệt nước, chiếc bàn lại nghiêng vì có ai vô tình đá lệch miếng chèn. Ông Phúc cúi xuống sửa rồi bật cười. Lần đầu tiên sau nhiều năm, ông thấy chiếc bàn cũ của cha mình đang chờ một ngày mai đông người.'
      ] },
      { period: '2022', title: 'Cuốn sổ mang tên những người cùng làm', paragraphs: [
        'Minh, em trai Lan, trở về sau một thời gian làm công việc văn phòng. Anh không khắc đẹp bằng bố, cũng chưa có con mắt chọn màu của chị, nhưng lại rất kiên nhẫn ghi chép. Anh bắt đầu bằng những thứ nhỏ: ai chuẩn bị giấy, ai kiểm ván, hôm nào in màu, ai ngồi lại cuối buổi để lựa từng bản.',
        'Cuốn sổ đầu tiên bị mọi người trêu là “sổ điểm danh”. Minh vẫn ghi, kể cả khi chỉ có hai người làm một đơn nhỏ. Đến lần một vị khách hỏi ai đã hoàn thiện bức tranh mình cầm, anh mở sổ và đọc được cả câu chuyện của buổi chiều hôm ấy. Người khách ở lại lâu hơn, còn ông Phúc lặng lẽ lấy thêm một chiếc ghế.',
        'Từ đó, tên người làm không còn đứng sau những công đoạn vô danh. Lan thêm ảnh và lời kể, Minh nối những mốc thời gian, còn bố kiểm lại những chi tiết nghề. Nhật ký của xưởng dần thành một lời cảm ơn viết bằng ngày tháng: một bản in đẹp luôn có nhiều hơn một đôi tay.'
      ] },
      { period: 'Hôm nay', title: 'Chừa một chỗ cho đời sau', paragraphs: [
        'Chiếc bàn đầu tiên giờ ở cạnh cửa, dưới tấm biển Nét Mộc đã được làm lại. An, con gái Lan, vừa đủ cao để nhìn qua mép bàn và bắt đầu tập in cùng ông ngoại. Khi bé hỏi sao bàn cứ nghiêng, Minh cúi xuống chỉ miếng gỗ chèn. Chừng nào nó còn ở đó, gia đình vẫn nhớ rằng sự ngay ngắn của hôm nay được dựng từ một khởi đầu không mấy ngay ngắn.',
        'Trong xưởng, thế hệ trẻ có thể chụp ảnh, viết nhật ký và đưa câu chuyện lên một trang sách số. Nhưng mỗi buổi sáng vẫn bắt đầu bằng việc mở cửa, lau bàn và nhìn lại tờ tranh dưới ánh sáng thật. Lan nói những công cụ mới có thể giúp người ở xa đến gần hơn; còn điều khiến họ muốn ở lại vẫn là giọng kể và sự chăm chút của người làm.',
        'Cuốn sách của Nét Mộc dừng ở đây, nhưng trên giá vẫn còn những tấm ván chưa đặt tên. Bên chiếc bàn cũ là một chiếc ghế nhỏ mới đóng, dành cho bất kỳ ai đủ tò mò để ngồi xuống. Gia đình không biết đời sau sẽ giữ nghề theo cách nào. Họ chỉ muốn khi người ấy bắt đầu, chỗ ngồi đã có sẵn và ngọn đèn vẫn còn sáng.'
      ] }
    ]
  },
  {
    name: 'Xưởng Sắc Điệp', ownerEmail: 'artisan2@vcraft.local', title: 'Một miền sáng trong tờ giấy',
    introduction: 'Trong ký ức của Sắc Điệp, người đầu tiên được nhắc đến là một người bà luôn đứng bên cửa để nhìn giấy dưới nắng. Từ một góc sân nhỏ, những người phụ nữ trong gia đình đã trao cho nhau cách quan sát, cách đợi và niềm tin rằng một sắc màu có thể giữ lại cả một mùa thương nhớ.',
    chapters: [
      { period: '1958', title: 'Bà Ngọc và vệt sáng đầu tiên', paragraphs: [
        'Bà Ngọc dựng góc làm việc đầu tiên ở cạnh cửa sổ phía đông. Buổi sáng, nắng đi qua giàn mướp, rơi thành những đốm nhỏ trên mặt bàn. Bà thường cầm tờ giấy lên rất lâu, xoay một chút sang trái rồi sang phải, như đang nghe nó nói điều gì. Những đứa trẻ trong nhà cứ nghĩ bà nhìn mãi một thứ chẳng có gì thay đổi.',
        'Một hôm, cô con gái nhỏ hỏi trên tờ giấy có gì mà mẹ cứ ngắm. Bà kéo con đến gần, để một nửa tờ giấy trong bóng và một nửa dưới nắng. Cùng một bề mặt, sắc sáng bỗng khác đi. Bà bảo có những thứ phải chịu khó thay chỗ đứng mới nhìn thấy. Đó là bài học chọn màu đầu tiên của gia đình, dù chẳng ai gọi nó là một bài học.',
        'Khi cần một cái tên để ghi trên bọc tranh, bà viết “Sắc Điệp” bằng nét chữ chậm. Bà không giải thích nhiều, chỉ nói muốn người mở bọc nhớ đến cảm giác nhìn một tờ giấy sáng lên trong buổi sớm. Chiếc cửa sổ ấy về sau được sửa lại vài lần, nhưng hướng đón nắng thì cả nhà luôn giữ nguyên.'
      ] },
      { period: '1975', title: 'Ba chiếc bát không bao giờ đổi chỗ', paragraphs: [
        'Trên giá gỗ của bà Ngọc có ba chiếc bát nhỏ, mỗi chiếc sứt một kiểu. Người ngoài nhìn vào tưởng chúng đã cũ đến mức nên bỏ, nhưng bà lại nhớ rất rõ chiếc nào dành cho màu nào. Mỗi tối, bà rửa sạch, lau khô rồi đặt lại đúng thứ tự, miệng úp xuống một tấm vải mềm.',
        'Hương, con gái bà, có lần dọn giá và xếp chúng theo độ lớn cho đẹp mắt. Sáng hôm sau, bà Ngọc không mắng mà lặng lẽ nhờ con pha lại ba sắc màu thường dùng. Hương lúng túng vì không còn những dấu quen để dựa vào. Cô mới hiểu một chỗ đặt đồ cũng có thể là cách một người nhớ công việc của mình qua nhiều năm.',
        'Từ đó, Hương xin mẹ cho làm một cuốn sổ màu. Bên mỗi mẫu thử, cô ghi trời hôm ấy nắng hay âm u, giấy mới mở hay đã để qua đêm. Những ghi chép còn vụng nhưng giúp hai mẹ con hiểu nhau hơn. Ba chiếc bát vẫn ở nguyên chỗ; cạnh chúng có thêm một quyển sổ mà những trang đầu luôn phảng phất mùi sân nhà sau cơn mưa.'
      ] },
      { period: '1989', title: 'Màu đỏ dành cho một người đi xa', paragraphs: [
        'Khi người em trai chuẩn bị rời quê, Hương muốn tặng em một bản tranh thật khác. Cô thử nhiều sắc đỏ, đặt chúng lên bàn rồi lại mang ra cửa sổ. Có sắc quá chói dưới nắng, có sắc vào trong nhà lại thành trầm lặng. Suốt mấy ngày, xưởng có thêm một góc nhỏ chỉ để những tờ giấy đỏ nằm cạnh nhau.',
        'Cuối cùng, bà Ngọc đưa Hương một mảnh vải cũ dùng gói quà Tết của gia đình. Sắc vải đã dịu đi theo năm tháng nhưng vẫn ấm. Hai mẹ con chọn bản in gợi đúng cảm giác ấy, không phải bản rực rỡ nhất. Trong bọc tranh, Hương viết một lời nhắn ngắn: “Ở đâu cũng nhớ một màu của nhà”.',
        'Nhiều năm sau, người em mang bức tranh về cho cả nhà xem. Mép giấy đã có dấu gấp, nhưng dòng chữ phía sau còn rõ. Từ câu chuyện nhỏ ấy, Sắc Điệp giữ thói quen hỏi người đặt tranh muốn gửi gắm điều gì trước khi hỏi họ thích màu nào. Có những lựa chọn đẹp hơn khi được bắt đầu bằng một người mình thương.'
      ] },
      { period: '1997', title: 'Mùa mưa và căn gác đầy giấy', paragraphs: [
        'Năm ấy mưa đến sớm, những buổi phơi tranh bị ngắt quãng liên tục. Mai, cháu gái bà Ngọc, vừa đi học về đã phụ mẹ chuyển giấy lên gác. Căn gác thấp, phải cúi đầu mỗi khi bước qua xà ngang, nhưng Mai thích ở đó vì từ ô cửa bé xíu có thể nhìn thấy cả khoảng sân lấp lánh nước.',
        'Trong những ngày chờ nắng, ba bà cháu ngồi phân loại những tờ giấy không còn đủ đẹp để dùng cho bản chính. Bà kể chuyện chiếc cửa sổ đầu tiên, Hương nhắc lại lần mình xếp nhầm ba chiếc bát. Mai nghe và cắt những mẩu nhỏ thành thẻ đánh dấu, mỗi thẻ ghi một điều vừa được kể. Những tờ giấy lỗi dần thành một bộ ký ức bỏ túi.',
        'Đến lúc nắng trở lại, căn gác không chỉ chứa những chồng giấy đã khô. Trên dây treo còn có hàng chục thẻ nhỏ, đung đưa khi ai mở cửa. Mai giữ lại chúng trong một chiếc hộp, sau này gọi đó là cuốn sách đầu tiên của xưởng: một cuốn sách chưa đóng gáy, được viết bằng những buổi cả nhà cùng chờ trời sáng.'
      ] },
      { period: '2008', title: 'Người cháu muốn thử một khoảng màu khác', paragraphs: [
        'Mai lớn lên với những mẫu màu quen thuộc đến mức có thể nhận ra chúng ngay khi bước vào gian làm việc. Nhưng khi bắt đầu nhận phần việc riêng, cô lại muốn thử những khoảng màu tiết chế hơn, để tờ giấy có nhiều chỗ thở. Hương lo những bản ấy trông quá nhẹ, còn Mai sợ mình chỉ đang lặp lại điều mẹ đã làm giỏi hơn từ lâu.',
        'Hai mẹ con thống nhất dành một buổi mỗi tuần để thử, không đem những bản thử ấy vào đơn hàng đang làm. Họ đặt bản cũ và bản mới cạnh nhau, nói cụ thể chỗ nào nên giữ, chỗ nào khiến người xem thấy lạ. Có buổi hai người tranh luận đến quên giờ cơm, rồi bà Ngọc chỉ cần đặt bát canh xuống giữa bàn là cả hai cùng bật cười.',
        'Điều Mai tìm được sau những buổi ấy không phải một bảng màu thay thế hoàn toàn. Cô học cách nhận ra phần hồn của một bản tranh trước khi thêm một ý riêng vào đó. Sắc Điệp bắt đầu có một ngăn mang tên “thử tiếp”, nơi bản in chưa thành công vẫn được giữ lại, vì mỗi lần thử đều để lại một câu hỏi có ích.'
      ] },
      { period: '2016', title: 'Bức tranh đi vào căn phòng mới', paragraphs: [
        'Một đôi vợ chồng trẻ đến xưởng, mang theo tấm ảnh căn phòng còn trống của mình. Họ thích tranh dân gian nhưng không biết đặt ở đâu giữa những món đồ mới. Mai ngồi cùng họ bên cửa sổ, dùng mảnh giấy cắt thành hình bức tranh rồi thử đặt lên tấm ảnh. Buổi trò chuyện kéo dài hơn cả buổi chọn mẫu.',
        'Thay vì làm một bản thật lớn để lấp khoảng tường, gia đình giúp họ chọn hai bản nhỏ, chừa một khoảng trống ở giữa. Hương sửa lại phần gói, đặt thêm một tờ kể chuyện ngắn phía sau. Món quà mang đi hôm ấy gọn gàng, nhưng chứa cả cuộc trò chuyện về nơi hai người muốn trở về sau mỗi ngày làm việc.',
        'Vài tháng sau, tấm ảnh căn phòng được gửi lại cho xưởng. Bên dưới hai bức tranh có một chiếc bàn và một bình hoa. Bà Ngọc nhìn rất lâu rồi bảo những tờ giấy của nhà mình đã có thêm một cửa sổ. Từ ấy, Sắc Điệp dành một góc để treo ảnh những không gian mà người nhận tự nguyện chia sẻ, như một cách biết câu chuyện đã đi tiếp ra sao.'
      ] },
      { period: '2021', title: 'Vy và chiếc hộp những màu không tên', paragraphs: [
        'Vy, con gái Mai, trở về phụ xưởng và nhận chiếc hộp thẻ giấy trên căn gác năm xưa. Nhiều mẩu đã ngả màu, nét chữ của mẹ có chỗ nhòe đi. Vy muốn chụp và sắp lại chúng để mọi người dễ xem, nhưng mỗi khi định ghi một tên thật gọn, cô lại phát hiện đằng sau mẩu giấy là một câu chuyện dài hơn mình nghĩ.',
        'Có màu Hương gọi bằng tên một mùa Tết, có mẩu bà Ngọc chỉ nhớ là lần Mai đi học về muộn. Vy bắt đầu ngồi hỏi từng người, ghi âm rồi chép lại bằng lời gần gũi. Cô hiểu rằng một danh mục chính xác chưa chắc đã thay được cảm giác nghe bà kể vì sao ngày hôm ấy căn bếp có mùi gừng.',
        'Chiếc hộp dần có một phiên bản số, nhưng bản giấy vẫn nằm ở chỗ cũ. Khách đến có thể xem ảnh phóng lớn rồi xin nghe thêm một mẩu chuyện. Bốn thế hệ của Sắc Điệp không có cùng cách ghi nhớ, nhưng cùng đồng ý giữ cả hai: sự tiện lợi để tìm lại và sự chậm rãi để thật sự nhớ một điều.'
      ] },
      { period: 'Hôm nay', title: 'Ánh sáng được chuyền qua nhiều bàn tay', paragraphs: [
        'Buổi sáng ở Sắc Điệp vẫn có người đứng cạnh cửa sổ, nghiêng tờ giấy một chút để nhìn. Có khi là Hương với thói quen cũ, có khi là Mai đang kiểm bản thử, có khi là Vy vừa đưa máy ảnh xuống. Không ai làm cử chỉ ấy giống hệt bà Ngọc, nhưng cả nhà đều nhận ra nó ngay lập tức.',
        'Xưởng hôm nay chia sẻ thêm ảnh, ghi lại từng chặng làm và kể chuyện bằng những trang có thể mở từ xa. Gia đình muốn người xem biết đằng sau một sắc màu là những lựa chọn rất nhỏ: đợi thêm một buổi, thử lại một lần, nghe kỹ hơn điều người nhận đang mong. Những việc ấy ít khi hiện lên trên mặt tranh, nhưng luôn có mặt trong cách họ làm.',
        'Ở trang cuối, Vy để một khoảng trắng và ghi bên dưới: “Dành cho màu chúng ta chưa gặp”. Bà Hương đọc, khẽ gật đầu rồi đặt cuốn sách cạnh ba chiếc bát. Với Sắc Điệp, giữ nghề có lẽ cũng giống giữ một vệt nắng: không nắm chặt trong tay, mà kiên nhẫn mở cửa để ánh sáng còn tìm được đường vào.'
      ] }
    ]
  },
  {
    name: 'Xưởng Hồn Quê', ownerEmail: 'artisan3@vcraft.local', title: 'Con đường trở về qua một bức tranh',
    introduction: 'Hồn Quê bắt đầu trong căn nhà có khoảng sân nhìn ra con ngõ nhỏ. Với gia đình, tranh là cách nhớ một miền sống: tiếng người gọi nhau, bữa cơm đợi khách và những buổi chiều trẻ con nán lại. Từ đời cụ Đức đến những người cháu hôm nay, cửa xưởng đã mở ra nhiều câu chuyện hơn số tranh từng được treo lên.',
    chapters: [
      { period: '1956', title: 'Căn nhà có cửa luôn mở', paragraphs: [
        'Cụ Đức không treo biển ở đầu ngõ. Người trong xóm nhận ra nhà cụ bằng chiếc cửa gỗ thường mở và tiếng ghế được kéo ra mỗi khi có khách. Bên trong, cụ in tranh trên một mặt bàn thấp, còn bà Mận đặt ấm nước cách chồng giấy một khoảng vừa đủ. Khách ghé hỏi đường đôi khi ngồi lại đến hết buổi, quên cả việc mình định đi đâu.',
        'Cụ thích những hình ảnh có người đang sống cùng nhau: một đoàn rước, một phiên chợ, một đứa trẻ trên lưng trâu. Khi in, cụ thường kể lại những cảnh mình từng thấy trong ngõ. Chuyện đôi lúc lan man, nhưng người nghe nhờ thế mà nhận ra tranh không chỉ nằm ở một nơi xa xưa; nó có thể bắt đầu từ chính tiếng cười bên chiếc cổng nhà mình.',
        'Bà Mận là người đầu tiên gọi góc làm việc ấy là Hồn Quê. Bà bảo cái tên không cần khiến ai nghĩ đến điều to tát, chỉ mong có người nhìn tranh rồi nhớ được một lối về. Về sau, tấm biển mới được đóng lên. Chiếc cửa gỗ thì vẫn mở như cũ, đủ để người đứng ngoài biết mình có thể bước vào hỏi một câu.'
      ] },
      { period: '1972', title: 'Giỏ tranh theo mẹ ra phiên chợ', paragraphs: [
        'Bình theo mẹ đi chợ từ lúc còn phải bước thật nhanh mới kịp nhịp đòn gánh. Trong giỏ là những bọc tranh được xếp phẳng, bên trên phủ một tấm vải. Bà Mận dặn con nếu mệt có thể dừng, nhưng đừng đặt giỏ xuống chỗ ẩm. Cậu nhớ lời ấy lâu hơn mọi lời mặc cả nghe được trong buổi sáng.',
        'Ở chợ, Bình ngạc nhiên vì mỗi người chọn tranh bằng một cách. Có người nhớ bức từng treo ở nhà bà ngoại, có người muốn mang về cho đứa con vừa biết nhìn hình. Bà Mận không vội giục. Bà mở từng bọc, kể một đoạn chuyện đủ ngắn để người khách tự nói tiếp ký ức của mình.',
        'Chiều về, giỏ nhẹ hơn nhưng câu chuyện trong đầu Bình nhiều hơn. Cậu bắt đầu hiểu công việc của cha mẹ không dừng ở lúc bản in khô. Bức tranh còn có một hành trình qua những bàn tay khác, đến những căn nhà mà mình chưa từng biết. Cũng từ những phiên chợ ấy, Bình tập nhớ tên người hỏi mua trước khi nhớ họ đã chọn mẫu nào.'
      ] },
      { period: '1983', title: 'Một buổi chiều nhường chỗ cho trẻ nhỏ', paragraphs: [
        'Khi bắt đầu phụ cha, Bình thích làm việc trong yên lặng. Đám trẻ đứng ngoài cửa tò mò thường khiến anh mất tập trung. Một buổi chiều, anh vừa định khép cửa thì cụ Đức kéo chiếc ghế của mình lùi vào trong, nhường khoảng sáng trước bàn. Cụ gọi bọn trẻ đến và hỏi chúng nhìn thấy gì trong bức tranh đang phơi.',
        'Những câu trả lời chẳng giống điều Bình đã chuẩn bị. Một em chỉ vào dáng người nhỏ ở góc tranh rồi kể chuyện ông nội; em khác thắc mắc vì sao con vật trong hình trông có vẻ vui. Cụ Đức lắng nghe, chỉ thêm vài đường nét rồi để chúng tự nghĩ. Gian nhà vốn chỉ có tiếng làm việc bỗng mở ra một cách thưởng tranh khác.',
        'Sau buổi ấy, Bình để sẵn vài chiếc ghế con ở cạnh cửa. Anh nhận ra sự yên lặng có thể giúp mình làm tốt một bản in, nhưng câu hỏi của người mới nhìn lại giúp mình nhớ vì sao muốn làm nó. Đám trẻ vẫn đến, có đứa rồi lớn lên và đi xa. Những chiếc ghế được sửa nhiều lần, cứ thấp nhỏ một cách bền bỉ bên chiếc bàn của người lớn.'
      ] },
      { period: '1999', title: 'Bưu thiếp gửi về từ một nơi rất xa', paragraphs: [
        'Một buổi gần Tết, xưởng nhận bưu thiếp của người khách từng ghé trú mưa. Mặt trước là một con phố xa lạ, mặt sau kể rằng bức tranh mua hôm ấy được treo trong gian bếp. Mỗi lần có bạn đến, người khách lại giải thích về căn nhà có cửa mở và ấm nước đặt cạnh bàn in. Bà Mận đọc đi đọc lại, dù đã thuộc gần hết từng dòng.',
        'Bình đem tấm bưu thiếp đặt bên bức tranh cùng mẫu, thấy hai thứ vốn xa nhau bỗng có một sợi dây nối. Anh bắt đầu giữ lại những lá thư khách cho phép chia sẻ, kẹp chúng vào một cuốn sổ bìa xanh. Có thư chỉ vài câu, có thư kèm ảnh, cũng có người nhiều năm sau mới quay lại để kể thêm đoạn tiếp theo.',
        'Cuốn sổ bìa xanh không được gọi là sổ thành tích. Trong nhà, mọi người gọi nó là “sổ những nơi tranh đã đến”. Hà, con gái Bình, lớn lên bằng cách đọc những địa danh trong đó. Cô chưa hình dung hết thế giới rộng đến đâu, nhưng đã biết một bức tranh nhỏ có thể khiến hai người ở rất xa cùng nhớ về một buổi mưa trong ngõ.'
      ] },
      { period: '2008', title: 'Hà đi xa để học cách kể gần', paragraphs: [
        'Hà rời nhà đi học, mang theo bản tranh cha gói ở đáy va li. Những ngày đầu, cô bận đến mức chưa tìm được chỗ treo. Đến một tối nhớ nhà, Hà mở bọc, ngửi thấy mùi giấy rất nhẹ và bất giác nhớ tiếng mẹ gọi ăn cơm từ cuối sân. Cô nhận ra điều mình nhớ nhất không phải một đồ vật, mà là nhịp sống đã ở quanh đồ vật ấy.',
        'Trong một bài tập kể chuyện, Hà chọn viết về chiếc cửa của xưởng. Cô hỏi cha qua điện thoại vì sao ông nội luôn để nó mở. Bình trả lời bằng nhiều mẩu chuyện: người trú mưa, đám trẻ, bác đi tìm một hình quen để tặng người thân. Bài viết của Hà vì thế không có một nhân vật chính duy nhất, chỉ có những người gặp nhau ở cùng một ngưỡng cửa.',
        'Khi đem bài về đọc cho gia đình, cô lo mọi người thấy mình viết quá bình thường. Bà Mận lại thích chính đoạn kể tiếng ghế kéo trên nền nhà. Hà hiểu mình không cần làm quê hương trở nên xa lạ để nó đáng được kể. Có khi chỉ cần đứng đủ gần một điều quen thuộc và tìm cho nó những lời vừa vặn.'
      ] },
      { period: '2017', title: 'Chuyến ghé thăm không có bài giảng', paragraphs: [
        'Ngày đầu tổ chức một buổi trải nghiệm nhỏ, Hà viết sẵn lịch trình rất chi tiết. Cô tính cả lúc giới thiệu, lúc thử in và lúc chụp ảnh. Nhưng nhóm khách vừa vào đã dừng ở chiếc giỏ cũ của bà Mận. Một người hỏi về nó, người khác kể mình cũng từng theo mẹ ra chợ. Buổi gặp bắt đầu muộn hơn dự tính, nhưng chẳng ai có vẻ sốt ruột.',
        'Bình ngồi xuống, lấy ra cuốn sổ bìa xanh và để khách tự chọn một trang. Câu chuyện của chuyến đi được dẫn bằng câu hỏi, không theo thứ tự Hà đã viết. Đến phần thử in, những người vốn ngại làm bẩn tay lại là người nán lại lâu nhất. Họ cầm tờ giấy của mình, so sánh những khác biệt nhỏ và hỏi thêm về người đã làm cùng.',
        'Tối ấy, Hà gạch bớt nhiều mục trong lịch trình. Cô vẫn cần chuẩn bị để khách được đón tiếp chu đáo, nhưng hiểu không nên lấp kín mọi khoảng trống. Xưởng giữ lại thời gian cho một tách nước, cho câu hỏi bất chợt và cho người khách muốn ngồi yên nhìn một bản tranh mà chưa cần nói gì.'
      ] },
      { period: '2023', title: 'Tú vẽ lại đường về nhà ông', paragraphs: [
        'Tú, con trai Hà, có một bài tập vẽ đường từ nhà đến nơi mình thích. Cậu chọn xưởng của ông ngoại. Trên giấy, con ngõ ngoằn ngoèo hơn thực tế, cây bên cổng to gần bằng mái nhà, còn chiếc cửa được tô một màu đỏ rất rõ. Cậu giải thích không muốn người xem đi lạc ở đoạn cuối.',
        'Hà đem bức vẽ đặt cạnh tấm bản đồ trên điện thoại. Một bên chỉ đúng từng ngã rẽ, một bên giữ những thứ khiến một đứa trẻ nhận ra mình đã về đến nơi. Hai mẹ con cùng đi lại con ngõ, chụp những góc ông thường kể và ghi chú những đoạn khách mới dễ nhầm. Tú nhất định giữ câu “thấy cửa mở là tới” trong phần mô tả của mình.',
        'Xưởng có thêm những chỉ dẫn rõ ràng cho người ghé, nhưng bức vẽ của Tú vẫn được treo ở cạnh bàn nước. Bốn thế hệ mỗi người nhớ lối về bằng một cách. Với Bình là tiếng bước chân của mẹ bên giỏ tranh, với Hà là một bài viết, còn với Tú là chiếc cửa đỏ đủ lớn để không ai vô tình đi qua mất.'
      ] },
      { period: 'Hôm nay', title: 'Trang cuối vẫn hướng ra con ngõ', paragraphs: [
        'Khách bây giờ có thể biết đến Hồn Quê qua một đường dẫn, xem trước hình ảnh và đọc chuyện của gia đình khi còn ở rất xa. Hà thích điều đó, vì mỗi người được tự chọn nhịp bước vào câu chuyện. Có người muốn xem tranh trước, có người lại mở cuốn sách để đọc về chiếc giỏ của bà Mận hoặc tấm bưu thiếp cũ.',
        'Trong gian làm việc, Bình vẫn giữ những chiếc ghế thấp cho người mới đến. Tú thỉnh thoảng phụ ghi tên những bức tranh đang phơi, rồi chạy ra xem có ai đứng ngoài cửa. Những thay đổi mới được đặt cạnh đồ vật cũ, không chen nhau giành chỗ. Cuốn sổ bìa xanh có thêm những trang ảnh, còn ấm nước vẫn cách chồng giấy một khoảng vừa đủ.',
        'Nếu một ngày ghé xưởng, bạn có thể chẳng gặp đúng cảnh nào vừa đọc. Đó là điều gia đình vẫn mong: câu chuyện không đứng yên trong sách, mà tiếp tục đổi khác cùng người sống trong nó. Trang cuối của Hồn Quê vì thế không khép bằng một lời tổng kết. Nó để lại hình ảnh một chiếc cửa, và phía bên kia là con ngõ đang đợi tiếng chân tiếp theo.'
      ] }
    ]
  },
];

function serializeWorkshopBook(book) {
  return [`# ${book.title}`, FICTION_NOTE, book.introduction,
    ...book.chapters.flatMap(chapter => [`## ${chapter.period} · ${chapter.title}`, ...chapter.paragraphs])].join('\n\n');
}

module.exports = { FICTION_NOTE, workshopBooks, serializeWorkshopBook };
